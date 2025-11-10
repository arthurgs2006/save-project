import React, { useState, useEffect } from "react";
import {
  Container,
  Carousel,
  CarouselItem,
  CarouselIndicators,
  CarouselCaption,
} from "reactstrap";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

export default function WelcomePage() {
  const items = [
    { id: 0, text: "Seus gastos, suas metas, seu controle." },
    { id: 1, text: "Acompanhe suas despesas e entradas de forma rápida e prática." },
    { id: 2, text: "Defina objetivos de economia e veja seu progresso em tempo real." },
  ];

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const next = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previous = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToIndex = (newIndex: number) => setActiveIndex(newIndex);

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 3000);
    return () => clearInterval(timer);
  }, []); // roda apenas uma vez

  return (
    <main className="background-color d-flex align-items-center justify-content-center">
      <Container>
        <motion.div
          className="welcome-page d-flex justify-content-center flex-column align-items-center text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Título animado */}
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Bem-vindo ao app
          </motion.h3>

          {/* Logo / marca */}
          <motion.div
            className="brand"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            save
          </motion.div>

          {/* Carrossel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            style={{ width: "100%", backgroundColor: "transparent", paddingBottom: "3cm" }}
          >
            <Carousel
              activeIndex={activeIndex}
              next={next}
              previous={previous}
              ride={undefined}
              slide
              fade={false}
            >
           


              {items.map((item) => (
                <CarouselItem key={item.id}>
                  <motion.div
                    className="carousel-tagline d-flex align-items-center justify-content-center bg-transparent"
                    style={{ minHeight: 105, padding: "0 1rem" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="tagline">{item.text}</div>
                  </motion.div>
                  <CarouselCaption captionText="" captionHeader="" />
                </CarouselItem>
              ))}
            </Carousel>
          </motion.div>
   

          <motion.div
            className="actions mt-4 h-100 d-flex flex-column gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <a href="/login" className="btn primary" role="button">
              Login
            </a>
            <a href="/signin" className="ghost ms-3" role="button">
              Caso não tenha uma conta, cadastre-se
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </main>
  );
}
