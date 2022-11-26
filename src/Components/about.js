import React from "react";
import "../Styles.scss";
import { Manifesto } from "./manifesto";

export const About = () => {
	return (
		<>
			<h1 className="section__title">{"about"}</h1>
			<div className="about">
				<div className="about__info">
					<p>
					We are two friends passionate about the pleasures of life. We are both from Brazil but our paths only crossed here in London a few years ago: what brought us together was our interest in sexuality. Whenever one of us learns something new and inspiring, we share it with the other: we have been growing together, each on their own timing. What started with a sex toy showcase and a Pompoir / Kegel exercises, evolved into a transformative journey of self-knowledge. Through courses in Women's Sexuality, Women’s Pleasure, Tantric Massage and Orgasmic Therapy, we discovered and unlocked a revolutionary level of self-love and empowerment.						
					<br></br>
					<br></br>
					You can read about our mission in the F.Y.V. manifesto below. But first, we must recognise that our privileges as two white, cisgender and able-bodied women have shaped our life experiences and consequently how we see the world. So we are continuously striving to broaden our views and confront our unconscious biases. The path of self-actualisation is never-ending. Our goal is to share what we learn along the way and which has the potential of empowering others. We hope to keep expanding our vision and to invite you to join us in an open conversation.
					</p>
				</div>
				<div className="about__bio">
					<div className="about__block">
						<img src={require(`../Images/paula_headshot.jpg`)} alt={"img-about-Paula"} />
						<p>
							<span>I'm Paula</span> (she/her) and it took me 30 years to fall in love with my vulva. It was such a transformative moment that I commemorate it every year by taking her out on a night filled with my favourite pleasures. I named it Vulversary. Celebrating myself and my vulva is the most empowering experience! So I want all women to unlock the power of loving themselves completely.
						</p>
					</div>
					<div className="about__block">
						<img src={require(`../Images/bea_headshot.jpg`)} alt={"img-about-Bea"} />
						<p>
							<span>I'm Beatriz</span> (she/her), but you can call me Bea. I have a Latin Brazilian soul, Polish blood and a travelled mind. I saw the positive impact I had on my friend's life by introducing their very first sex toys. Through the journey of pleasure, we became stronger as women. And since then, I knew I wanted to continue to boost their inner power through sexuality.
						</p>
					</div>
				</div>
			</div>
			<Manifesto />
		</>
	);
};
