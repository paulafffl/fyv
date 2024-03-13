import '../Styles.scss';
import { Section } from './section';
import { contentPosts } from '../Content/content_posts';

export const Posts = () => {
    return (
        <Section
            title={'posts'}
            content={contentPosts}
            posts
            initialDisplay={6}
        />
    );
};
