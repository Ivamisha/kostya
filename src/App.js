import React, { useState } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useDrag } from "react-use-gesture";

import styles from "./styles.module.css";

const cards = [
  "https://sun9-80.userapi.com/impg/c858528/v858528969/983a1/l-efUu_Y780.jpg?size=1620x2160&quality=96&sign=947d99cebb622df174f1a09751fa55bb&type=album",
  "https://sun9-27.userapi.com/impf/c841633/v841633017/4df45/4tcasPILtJc.jpg?size=1215x2160&quality=96&sign=ed714f1272a56a548fec261254baec76&type=album",
  "https://sun9-62.userapi.com/impf/c851120/v851120574/80671/MLO3fdJUTlE.jpg?size=1620x2160&quality=96&sign=5f6819537c9d22733f0f096d172ac746&type=album",
  "https://sun9-27.userapi.com/impg/H5dxeycAncGS5snZvLyo8Jp_QVUwdQcrXC9wpg/d8VUS4da56Y.jpg?size=810x1080&quality=96&sign=2e796e5814d74ae6b0042df76452d365&type=album",
  "https://sun9-5.userapi.com/impg/IKtGg9PVxufjiS-HzRdYcPdcz7hRMd-GZNNxHA/RG7GTJL-EQE.jpg?size=960x1280&quality=95&sign=731101083077f9466c196d6c36a6acfd&type=album",
  "https://sun9-80.userapi.com/impg/c858528/v858528969/983a1/l-efUu_Y780.jpg?size=1620x2160&quality=96&sign=947d99cebb622df174f1a09751fa55bb&type=album",
];

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

function Deck() {
  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [props, api] = useSprings(cards.length, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
      const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
      if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start((i) => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index);
        const x = isGone ? (100 + window.innerWidth) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
        const scale = down ? 1.1 : 1; // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });
      if (!down && gone.size === cards.length)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cards[i]})`,
            }}
          />
        </animated.div>
      ))}
    </>
  );
}

export default function App() {
  return (
    <div className={styles.container}>
      <Deck />
    </div>
  );
}
