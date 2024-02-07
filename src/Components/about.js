import React from "react";
import "../Styles.scss";
import { Manifesto } from "./manifesto";

export const About = () => {
  return (
    <>
      <h1 className="section__title">{"about"}</h1>
      <div className="about">
        <div className="about__photo">
          <img
            src={require(`../Images/paula_headshot_new.jpg`)}
            alt={"img-about-Paula"}
          />
          <p>
            <span>
              Pleasure to meet you,
              <br />
              I'm P!{" "}
            </span>{" "}
            (she/her)
            <br />
            <br />
            But you can also call me by my name, Paula - even if you are unsure
            about its Brazilian pronunciation.
            <br />I do love "P" though, because I feel it also stands for the
            core values of this passion project: Pussy, Pleasure & Power.
          </p>
        </div>
        <div className="about__text">
          <p>
            It took me 30 years to fall in love with myself. I had to go through
            years of conventional and alternative therapies, as well as courses
            in Pompoir & Kegel, Women's Sexuality, Women’s Pleasure, Tantric
            Massage and Sexological Bodywork. But then, I discovered a
            revolutionary level of pleasure and self-love.
            <p></p>
            Letting go of ingrained shame about my vulva was the last piece
            missing for me to completely embrace myself. And the moment I first
            looked at it with only admiration was one of the biggest turning
            points. It was so transformative that I commemorate it every year by
            taking her out on a night filled with my favourite pleasures. I
            named it Vulversary! Celebrating myself and my vulva was the most
            empowering experience. And the positive impact this had in every
            single sphere of my life drove me to create this project, to help
            others to also unlock their self-love.
          </p>
        </div>
        <div className="about__text">
          <p>
            Coming from a place of nonexistent self-esteem, this journey took me
            a huge investment of time, energy and money. One that is not
            available to most people. But I believe all deserve access to this
            knowledge and power. And because I know so many that desperately
            need it, I'm committed to sharing all that I learned in the most
            accessible and pleasurable way.
            <p></p>I recognise that my privileges as a white, cisgender and
            able-bodied woman have shaped my life experiences and consequently
            how I see the world. But I still hope to shed some light to clear
            this path for others. I am continuously striving to broaden my views
            and confront my unconscious biases, as self-actualisation is a
            never-ending process. All that I intend is to share what I learn
            along the way, which has the potential to empower others. The
            following manifesto explains how.
          </p>
        </div>
      </div>
      <Manifesto />
      <h1 className="section__title">{"acknowledgement"}</h1>
      <div className="about">
        <div className="about__photo">
          <img
            src={require(`../Images/bea_headshot.jpg`)}
            alt={"img-about-Bea"}
          />
          <p>
            <span>Beatriz, aka Bea</span> (she/her)
          </p>
        </div>
        <div className="about__text">
          <p>
            Most of the self-love path must be walked alone, but without some
            very special people in my life, I wouldn’t have known this was
            possible or had the strength to keep pursuing it. I make sure they
            all know how grateful I am for them, but it would be too long to
            explain all the connections that contributed to my journey. However,
            if there is one person that must be acknowledged, is Bea. She not
            only founded F.Y.V. with me but also was the one that introduced me
            to my very first sex toy, to the best course I've done in Women’s
            Sexuality and to the Brazilian Terapia Orgástica.
          </p>
        </div>
        <div className="about__text">
          <p>
            It was the biggest privilege to have her help and support to create
            this, but she realised that this cycle had come to an end for her. I
            will be forever grateful for her believing in the idea and being a
            driving force to get this project off the ground. For giving me her
            blessing and encouragement to continue F.Y.V. on my own. For being
            next to me through thick and thin. For helping me find myself again
            when I was lost. And for being a gateway for so much self-love and
            pleasure in my life. With the deepest admiration and love, thank you
            Bea for everything.
          </p>
        </div>
      </div>
    </>
  );
};
