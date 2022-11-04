import React from "react";
import "../Styles.scss";
import { Manifesto } from "./manifesto";

export const About = () => {
	return (
		<>
			<h1 className="section__title">{ }</h1>
			<div className="about">
				<div className="about__info">
					<h1>about us</h1>
					<p>
						Hi! We’re Paula and Beatriz, friends that share, among many other
						things, a natural curiosity and la joie de vivre. We're both from Brazil but only met in London in 2019.
						Since then, we’ve been living a beautiful journey of
						self-discovery and self-knowledge. Whenever one of us learned
						something new and inspiring, we’d share it with the other. One step
						at a time and each one on its own timing, we grew together.
						Through courses in Women's Sexuality & Pleasure, Tantric & Orgasmic Massages, Pompoir &
						Female Anatomy, we unlocked a revolutionary level of self-love and empowerment.
						<br></br>
						<br></br>
						As two white, cisgender, and able-bodied women, we’re aware that our
						privileges shaped our life experiences and consequently how we see
						the world. But we’re continuously striving to broaden our views and
						confront our unconscious biases. Our goal is to share all that we
						learned to empower others, but as Einstein
						brilliantly said, “the more I learn, the more I realize how much I
						don't know.”. We’re just learners trying to expand our sight and
						hoping to bring others to join this open conversation with us.
					</p>
				</div>
				<div className="about__bio">
					<div className="about__block">
						<img src={require(`../Images/paula_headshot.jpg`)} alt={"img-about-Paula"} />
						<p>
							<span>I’m Paula</span> (she/her) a 31 years old that
							only recently fell in love with her vulva. It was such a
							transformative moment that I promised myself to commemorate it
							every year, by taking her out and treating myself to my favourite
							pleasures. I called it Vulversarsy. I had my first one this year
							and it was the most empowering experience to celebrate myself like
							that.
						</p>
					</div>
					<div className="about__block">
						<img src={require(`../Images/bea_headshot.jpg`)} alt={"img-about-Bea"} />
						<p>
							<span>I’m Beatriz</span> (she/her), 31, also called Bea. I have a
							Latin Brazilian soul, Polish blood and a travelled mind. I can’t
							live without a good laugh and I like to think that unicorns
							existed. Sharing about our inner power is something that makes me
							happy and fulfilled!
						</p>
					</div>
				</div>
			</div>
			<Manifesto />
		</>
	);
};
