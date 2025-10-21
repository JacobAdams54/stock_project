import React from "react";


export function Hero() {
  return (
    <section
      className="bg-gradient-to-br from-slate-50 to-teal-50 py-20"
      aria-label="Hero section: AI-Powered Stock Predictions"
    >
      <h1>AI-Powered Stock Predictions</h1>
      <p>Make smarter investment decisions</p>
      <button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("navigate", { detail: { page: "signup" } })
          )
        }
      >
        Get Started
      </button>
      <img src="/placeholder.jpg" alt="Stock market chart illustration" />
    </section>
  );
}
