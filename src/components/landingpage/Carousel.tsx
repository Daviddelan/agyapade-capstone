import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Slide {
  image: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    image: 'https://res.cloudinary.com/dt3xctihn/image/upload/v1739151832/slide1_cmhxaa.jpg',
    title: 'Streamlined Operations',
    description: 'Efficient management solutions for modern institutions',
  },
  {
    image: 'https://res.cloudinary.com/dt3xctihn/image/upload/v1739151832/slide2_gn55yw.jpg',
    title: 'Secure Transactions',
    description: 'Blockchain-powered security for all your operations',
  },
  {
    image: 'https://res.cloudinary.com/dt3xctihn/image/upload/v1739151832/slide3_rygbge.jpg',
    title: 'Real-time Analytics',
    description: 'Make data-driven decisions with our advanced analytics',
  },
  {
    image: 'https://res.cloudinary.com/dt3xctihn/image/upload/v1739151831/slide4_kqogce.jpg',
    title: 'Real-time Analytics',
    description: 'Make data-driven decisions with our advanced analytics',
  },
  {
    image: 'https://res.cloudinary.com/dt3xctihn/image/upload/v1739151832/slide5_qtp1cg.jpg',
    title: 'Real-time Analytics',
    description: 'Make data-driven decisions with our advanced analytics',
  },
];

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-screen flex-shrink-0 relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <h2 className="text-5xl font-bold text-yellow-400 mb-4">{slide.title}</h2>
              <p className="text-xl text-yellow-100 max-w-2xl">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-yellow-400 p-3 rounded-full hover:bg-opacity-70 transition duration-300"
      >
        <FaChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-yellow-400 p-3 rounded-full hover:bg-opacity-70 transition duration-300"
      >
        <FaChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-white'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
