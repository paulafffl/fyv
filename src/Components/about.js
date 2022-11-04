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
						We’re friends that share, among many other things, a natural curiosity about the pleasures of life. Born and raised in Brazil, but our paths only crossed in London 3 years ago. And what brought us together was our passion for learning about sexuality. Whenever one of us learned something new and inspiring, we’d share it with the other. One step at a time and each one on its own timing, we grew together. What started with a sex toy showcase for Bea and a Pompoir / Kegel course for Paula, evolved into a deep and beautiful journey of self-knowledge. Through courses in Women's Sexuality, Women’s Pleasure, Tantric Massage, and Orgasmic Therapy, we discovered and unlocked a revolutionary level of self-love and empowerment.
						<br></br>
						<br></br>
						Our mission is defined in the manifesto below. But before getting there, we must recognise that our privileges as two white, cisgender, and able-bodied women shaped our life experiences and consequently how we see the world. So we’re continuously striving to broaden our views and confront our unconscious biases. Our goal is to share knowledge with the potential to empower others, but we’re aware that we’re just learners. And the path of self-actualisation is never-ending. So we hope to keep expanding our sight and to bring others to join us in an open conversation.
					</p>
				</div>
				<div className="about__bio">
					<div className="about__block">
						<img src={require(`../Images/paula_headshot.jpg`)} alt={"img-about-Paula"} />
						<p>
							<span>Paula</span> (she/her) took 30 years to fall in love with her vulva. It was such a transformative moment that she promised to commemorate it every year, by taking herself out and having a night filled with all of her favourite pleasures. She named it Vulversary. And it was the most empowering experience to celebrate herself and her vulva.
						</p>
					</div>
					<div className="about__block">
						<img src={require(`../Images/bea_headshot.jpg`)} alt={"img-about-Bea"} />
						<p>
							<span>Beatriz</span> (she/her), also called Bea, has a Latin Brazilian soul, Polish blood and a travelled mind. She can’t live without a good laugh and she likes to think that unicorns existed. Sharing about our inner power is something that makes her happy and fulfilled!
						</p>
					</div>
				</div>
			</div>
			<Manifesto />
		</>
	);
};
