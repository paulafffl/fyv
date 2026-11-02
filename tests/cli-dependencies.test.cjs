const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const test = require('node:test');

// Resolve through Firebase's dependency graph so these tests verify its overrides.
const fromFirebase = createRequire(
    require.resolve('firebase-tools/package.json'),
);

test('Firebase HTTP client builds multipart requests using the patched UUID API', async () => {
    const { Gaxios } = fromFirebase('gaxios');
    const client = new Gaxios();
    const response = await client.request({
        url: 'https://example.invalid/upload',
        method: 'POST',
        multipart: [
            { headers: { 'Content-Type': 'text/plain' }, content: 'fyv-smoke' },
        ],
        // Exercise serialization without credentials or an outbound request.
        adapter: async (options) => {
            assert.match(
                options.headers['Content-Type'],
                /multipart\/related; boundary=[\da-f-]{36}$/,
            );
            let body = '';
            for await (const chunk of options.body) body += chunk.toString();
            assert.ok(body.includes('fyv-smoke'));
            return { config: options, data: 'ok', status: 200, headers: {} };
        },
    });
    assert.equal(response.data, 'ok');
});

test('Firebase Pub/Sub client remains compatible with patched trace propagation', async () => {
    const { PubSub } = fromFirebase('@google-cloud/pubsub');
    const fromPubSub = createRequire(
        fromFirebase.resolve('@google-cloud/pubsub/package.json'),
    );
    const { W3CTraceContextPropagator } = fromPubSub('@opentelemetry/core');
    const api = fromPubSub('@opentelemetry/api');
    const spanContext = {
        traceId: '0123456789abcdef0123456789abcdef',
        spanId: '0123456789abcdef',
        traceFlags: 1,
    };
    const propagator = new W3CTraceContextPropagator();
    const carrier = {};
    propagator.inject(
        api.trace.setSpanContext(api.ROOT_CONTEXT, spanContext),
        carrier,
        api.defaultTextMapSetter,
    );
    const extracted = api.trace.getSpanContext(
        propagator.extract(api.ROOT_CONTEXT, carrier, api.defaultTextMapGetter),
    );
    assert.equal(extracted.traceId, spanContext.traceId);
    assert.equal(extracted.spanId, spanContext.spanId);
    const client = new PubSub({ projectId: 'demo-fyv' });
    assert.equal(client.topic('smoke').name, 'projects/demo-fyv/topics/smoke');
    await client.close();
});
