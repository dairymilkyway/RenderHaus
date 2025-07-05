import React, { Suspense } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import {
  CubeIcon,
  PaintBrushIcon,
  ViewfinderCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Room3D } from './Room3D';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-left">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="hero-title"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Build Your Vision in Interactive 3D
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Step into the future of home design with our immersive 3D visualization tool.
              Mix, match, and experiment with materials and styles to bring your perfect space to life.
            </motion.p>
            <motion.div 
              className="cta-container"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RouterLink
                to="/auth"
                className="cta-button"
              >
                Start Creating
                <ArrowRightIcon className="w-5 h-5" />
              </RouterLink>
            </motion.div>
          </motion.div>
          <motion.div 
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>Scroll to explore</span>
            <div className="scroll-line"></div>
          </motion.div>
        </div>
        
        <div className="hero-right">
          <div className="canvas-container">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <Room3D />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why Choose NaviBuild
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Experience the perfect blend of creativity and technology with our innovative 3D design platform
        </motion.p>
        <motion.div 
          className="features-grid"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              icon: <CubeIcon className="feature-icon" />,
              title: "3D Visualization",
              description: "Experience your design in immersive 3D, allowing you to view your space from any angle."
            },
            {
              icon: <PaintBrushIcon className="feature-icon" />,
              title: "Real Materials",
              description: "Choose from a vast library of real-world materials, textures, and colors."
            },
            {
              icon: <ViewfinderCircleIcon className="feature-icon" />,
              title: "Precise Measurements",
              description: "Get accurate dimensions and specifications for your design projects."
            },
            {
              icon: <ArrowPathIcon className="feature-icon" />,
              title: "Real-time Updates",
              description: "See changes instantly as you modify materials, colors, and dimensions."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={fadeInUp}
              custom={index}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};

export default LandingPage; 