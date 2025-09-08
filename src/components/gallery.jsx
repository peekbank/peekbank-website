import { useState, useEffect } from "react";
import RaccoonEyes from "./raccoon";

import goatSvg from "/src/assets/stimuli/goat.svg?url";
import elephantSvg from "/src/assets/stimuli/elephant.svg?url";
import cookiePng from "/src/assets/stimuli/cookie.png?url";
import dogPng from "/src/assets/stimuli/dog.png?url";
import duckPng from "/src/assets/stimuli/duck.png?url";
import sawSvg from "/src/assets/stimuli/saw.svg?url";
import pencilPng from "/src/assets/stimuli/pencil.png?url";
import birdPng from "/src/assets/stimuli/bird.png?url";
import carPng from "/src/assets/stimuli/car.png?url";
import tablePng from "/src/assets/stimuli/table.png?url";
import catPng from "/src/assets/stimuli/cat.png?url";

const imagePairs = [
  {
    word: "elephant",
    leftImage: goatSvg,
    rightImage: elephantSvg,
  },
  {
    word: "cookie",
    leftImage: cookiePng,
    rightImage: dogPng,
  },
  {
    word: "duck",
    leftImage: duckPng,
    rightImage: goatSvg,
  },
  {
    word: "dog",
    leftImage: dogPng,
    rightImage: sawSvg,
  },
  {
    word: "pencil",
    leftImage: pencilPng,
    rightImage: sawSvg,
  },
  {
    word: "bird",
    leftImage: cookiePng,
    rightImage: birdPng,
  },
  {
    word: "car",
    leftImage: carPng,
    rightImage: tablePng,
  },
  {
    word: "table",
    leftImage: tablePng,
    rightImage: sawSvg,
  },
  {
    word: "goat",
    leftImage: goatSvg,
    rightImage: pencilPng,
  },
  {
    word: "cat",
    leftImage: catPng,
    rightImage: sawSvg,
  },
];

const ImageContainer = ({ layer1Image, layer2Image, showLayer1, altText }) => {
  const layers = [
    { image: layer1Image, isVisible: showLayer1 },
    { image: layer2Image, isVisible: !showLayer1 }
  ];

  return (
    <div className="w-20 h-20 flex items-center justify-center relative self-center mt-0">
      {layers.map(({ image, isVisible }, index) => (
        <div
          key={index}
          className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
          style={{
            transform: isVisible ? "scale(1)" : "scale(0)",
            opacity: isVisible ? 1 : 0,
          }}
        >
          <img
            src={image}
            alt={altText}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ))}
    </div>
  );
};

const RotatingGallery = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [layer1Index, setLayer1Index] = useState(0);
  const [layer2Index, setLayer2Index] = useState(0);
  const [showLayer1, setShowLayer1] = useState(true);

  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const getCurrentItemName = () => {
    const currentIndex = showLayer1 ? layer1Index : layer2Index;
    return imagePairs[currentIndex].word;
  };

  // Main rotation effect - only run on larger screens
  useEffect(() => {
    if (isSmallScreen) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % imagePairs.length;
      
      if (showLayer1) {
        setLayer2Index(nextIndex);
      } else {
        setLayer1Index(nextIndex);
      }
      
      setCurrentIndex(nextIndex);
      setShowLayer1(prev => !prev);
  
      setDisplayText("");
      setIsTyping(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [showLayer1, imagePairs.length, isSmallScreen, currentIndex]);

  // Typing animation - only run on larger screens
  useEffect(() => {
    if (isSmallScreen) return;

    const currentItem = getCurrentItemName();
    if (isTyping) {
      // Typing phase
      if (displayText.length < currentItem.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentItem.slice(0, displayText.length + 1));
        }, 150); // Typing speed
        return () => clearTimeout(timer);
      } else {
        // Holding
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 3000); // Hold time
        return () => clearTimeout(timer);
      }
    } else {
      // Erasing phase
      if (displayText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100); // Erasing speed
        return () => clearTimeout(timer);
      }
    }
  }, [displayText, isTyping, showLayer1, layer1Index, layer2Index, isSmallScreen]);


  if (isSmallScreen) {
    return (
      <div className="flex items-center justify-center">
        <RaccoonEyes />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Typing text animation */}
      <div className="mb-0 text-center">
        <h2 className="font-librebask sm:text-xl md:text-2xl font-semibold text-gray-700">
          Where's the{" "}
          <span className="font-black text-black underline">{displayText}</span>
          ?
        </h2>
      </div>

      {/* Main gallery */}
      <div className="flex items-start justify-center gap-8 sm:gap-20 lg:gap-30 transform">
        <ImageContainer
          layer1Image={imagePairs[layer1Index].leftImage}
          layer2Image={imagePairs[layer2Index].leftImage}
          showLayer1={showLayer1}
          altText="left stimulus"
        />

        <div className="flex items-center justify-center">
          <RaccoonEyes />
        </div>

        <ImageContainer
          layer1Image={imagePairs[layer1Index].rightImage}
          layer2Image={imagePairs[layer2Index].rightImage}
          showLayer1={showLayer1}
          altText="Right stimulus"
        />
      </div>
    </div>
  );
};

export default RotatingGallery;