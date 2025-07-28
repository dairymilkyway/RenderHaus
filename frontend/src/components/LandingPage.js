import React, { Suspense } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import {
  CubeIcon,
  PaintBrushIcon,
  ViewfinderCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  PlayIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Room3D } from './Room3D';
import Footer from './Footer';

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
          Why Choose RenderHaus
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

      {/* About Section */}
      <section id="about" className="about">
        <div className="about-container">
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Revolutionizing Home Design</h2>
            <p className="section-subtitle">
              RenderHaus combines cutting-edge 3D technology with intuitive design tools to make professional-quality home visualization accessible to everyone.
            </p>
            <div className="about-features">
              {[
                {
                  icon: <UserGroupIcon className="about-feature-icon" />,
                  title: "Trusted by 10,000+ Users",
                  description: "Join thousands of designers, architects, and homeowners who trust RenderHaus"
                },
                {
                  icon: <ClockIcon className="about-feature-icon" />,
                  title: "Save 80% Time",
                  description: "Create stunning visualizations in minutes, not hours"
                },
                {
                  icon: <ShieldCheckIcon className="about-feature-icon" />,
                  title: "Enterprise Security",
                  description: "Your designs are protected with bank-level security"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="about-feature"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="about-feature-icon-wrapper">
                    {feature.icon}
                  </div>
                  <div className="about-feature-content">
                    <h4 className="about-feature-title">{feature.title}</h4>
                    <p className="about-feature-description">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div 
              className="about-cta"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button className="demo-button">
                <PlayIcon className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="about-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="about-image-placeholder">
              <div className="image-content">
                <h3>Interactive 3D Workspace</h3>
                <p>Experience real-time collaboration and instant feedback</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Comprehensive Design Solutions
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          From concept to completion, we provide all the tools you need for exceptional home design
        </motion.p>
        <motion.div 
          className="services-grid"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              title: "3D Room Visualization",
              description: "Create photorealistic 3D renderings of any room with our advanced visualization engine.",
              features: ["Real-time rendering", "Multiple view angles", "Lighting simulation", "Shadow effects"]
            },
            {
              title: "Material Library",
              description: "Access thousands of high-quality materials, textures, and finishes from top manufacturers.",
              features: ["5000+ materials", "Brand partnerships", "Custom textures", "Color variations"]
            },
            {
              title: "Collaboration Tools",
              description: "Share designs, get feedback, and collaborate with clients, contractors, and team members.",
              features: ["Real-time sharing", "Comment system", "Version control", "Export options"]
            },
            {
              title: "Project Management",
              description: "Organize your designs, track progress, and manage multiple projects from one dashboard.",
              features: ["Project templates", "Progress tracking", "File organization", "Client portals"]
            }
          ].map((service, index) => (
            <motion.div
              key={index}
              className="service-card"
              variants={fadeInUp}
            >
              <div className="service-header">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="service-feature">
                    <CheckIcon className="service-check-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What Our Users Say
        </motion.h2>
        <motion.div 
          className="testimonials-grid"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              name: "Sarah Johnson",
              role: "Interior Designer",
              company: "Design Studio Pro",
              image: "/api/placeholder/60/60",
              rating: 5,
              testimonial: "RenderHaus has completely transformed how I present designs to clients. The 3D visualizations are so realistic that clients can truly understand the space before construction begins."
            },
            {
              name: "Michael Chen",
              role: "Architect",
              company: "Chen Architecture",
              image: "/api/placeholder/60/60",
              rating: 5,
              testimonial: "The collaboration features are outstanding. My team can work on the same project simultaneously, and the real-time updates make our workflow incredibly efficient."
            },
            {
              name: "Emily Rodriguez",
              role: "Homeowner",
              company: "Home Renovation",
              image: "/api/placeholder/60/60",
              rating: 5,
              testimonial: "As someone with no design experience, RenderHaus made it easy for me to visualize my dream kitchen. The material library helped me make confident choices."
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              variants={fadeInUp}
            >
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="star-icon filled" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.testimonial}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src={testimonial.image} alt={testimonial.name} />
                </div>
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                  <p className="author-company">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="cta-title">Ready to Transform Your Design Process?</h2>
          <p className="cta-subtitle">
            Join thousands of professionals who have revolutionized their workflow with RenderHaus. 
            Start creating stunning 3D visualizations today.
          </p>
          <div className="cta-buttons">
            <RouterLink to="/auth" className="cta-primary">
              Start Free Trial
              <ArrowRightIcon className="w-5 h-5" />
            </RouterLink>
            <button className="cta-secondary">
              <PlayIcon className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
          <div className="cta-features">
            <div className="cta-feature">
              <GlobeAltIcon className="cta-feature-icon" />
              <span>Works on any device</span>
            </div>
            <div className="cta-feature">
              <ShieldCheckIcon className="cta-feature-icon" />
              <span>Secure & private</span>
            </div>
            <div className="cta-feature">
              <DocumentTextIcon className="cta-feature-icon" />
              <span>No credit card required</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default LandingPage; 