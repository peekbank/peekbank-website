import { useState, useEffect } from "react";
import RaccoonEyes from "./raccoon";

import babyImg from "/src/assets/stimuli/Baby.png?url";
import ballImg from "/src/assets/stimuli/Ball.png?url";
import bananaImg from "/src/assets/stimuli/Banana.png?url";
import birdyImg from "/src/assets/stimuli/Birdy.png?url";
import bookImg from "/src/assets/stimuli/Book.png?url";
import carImg from "/src/assets/stimuli/Car.png?url";
import cookieImg from "/src/assets/stimuli/Cookie.png?url";
import juiceImg from "/src/assets/stimuli/Juice.png?url";
import kittyImg from "/src/assets/stimuli/Kitty.png?url";
import shoeImg from "/src/assets/stimuli/Shoe.png?url";
import doggyImg from "/src/assets/stimuli/doggy.png?url";

const imagePairs = [
  { word: "birdy", leftImage: birdyImg, rightImage: kittyImg },
  { word: "banana", leftImage: bananaImg, rightImage: carImg },
  { word: "baby", leftImage: doggyImg, rightImage: babyImg },
  { word: "cookie", leftImage: cookieImg, rightImage: bookImg },
  { word: "shoe", leftImage: ballImg, rightImage: shoeImg },
  { word: "juice", leftImage: juiceImg, rightImage: carImg },
  { word: "kitty", leftImage: birdyImg, rightImage: kittyImg },
  { word: "book", leftImage: bookImg, rightImage: carImg },
  { word: "doggy", leftImage: babyImg, rightImage: doggyImg },
  { word: "ball", leftImage: shoeImg, rightImage: ballImg },
  { word: "car", leftImage: carImg, rightImage: bookImg },
];

const ImageContainer = ({ layer1Image, layer2Image, showLayer1 }) => {
  const layers = [
    { image: layer1Image, isVisible: showLayer1 },
    { image: layer2Image, isVisible: !showLayer1 }
  ];

  return (
    <div className="relative flex h-24 min-w-0 items-center justify-center">
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
            alt=""
            className="h-20 w-auto max-w-full object-contain"
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
    <div className="flex flex-col gap-4 px-6 pb-2">
      <div className="flex justify-center">
        <RaccoonEyes />
      </div>

      <p className="text-center font-librebask text-2xl tracking-tight text-ink mb-2">
        &ldquo;Where&apos;s the{" "}
        <em className="font-bold text-ink not-italic">{displayText}</em>?&rdquo;
      </p>

      <div className="grid grid-cols-2 gap-4">
        <ImageContainer
          layer1Image={imagePairs[layer1Index].leftImage}
          layer2Image={imagePairs[layer2Index].leftImage}
          showLayer1={showLayer1}
        />
        <ImageContainer
          layer1Image={imagePairs[layer1Index].rightImage}
          layer2Image={imagePairs[layer2Index].rightImage}
          showLayer1={showLayer1}
        />
      </div>
    </div>
  );
};

export default RotatingGallery;