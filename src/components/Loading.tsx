import { CgSpinner } from "react-icons/cg";
import Container from "./Container";
import { useEffect, useState } from "react";

const Loading = () => {
  const [randomized, setRandomized] = useState("");

  useEffect(() => {
    const facts = [
      "A group of flamingos is called a flamboyance.",
      "Elephants are the only mammals that can't jump.",
      "A group of pandas is called an embarrassment.",
      "Kangaroos use their tails to balance and as a powerful weapon to defend themselves.",
      "Sloths only defecate once a week and climb down from their trees to do so.",
      "Octopuses have three hearts and blue blood.",
      "Penguins propose to their mates with a pebble.",
      "Otters hold hands while they sleep to keep from drifting away from each other.",
      "A group of crows is called a murder.",
      "Some species of male seahorses give birth to their young.",
    ];
    setRandomized(facts[Math.floor(Math.random() * facts.length)] || "");
  }, []);

  return (
    <Container>
      <div className="flex flex-1 flex-col justify-center items-center">
        <h1 className="text-xl font-bold">Did you know that ...</h1>
        <p className="mb-6 text-center">{randomized}</p>
        <CgSpinner size={32} className="animate-spin" />
      </div>
    </Container>
  );
};

export default Loading;
