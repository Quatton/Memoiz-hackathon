import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        logo: `'Lobster Two', cursive`,
      },
    },
  },
  plugins: [require("daisyui")],
} satisfies Config;
