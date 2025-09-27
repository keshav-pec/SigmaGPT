import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import { ArrowRightIcon, SparklesIcon, ZapIcon, BrainIcon, MessageSquareIcon } from 'lucide-react';
import './AnimatedHomepage.css';

const AnimatedHomepage = ({ onStartChat }) => {
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    setMounted(true);
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: 'push',
        },
        onHover: {
          enable: true,
          mode: 'repulse',
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: ['#10a37f', '#ffffff', '#6366f1', '#f59e0b'],
      },
      links: {
        color: '#10a37f',
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
        random: true,
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
        },
      },
      shape: {
        type: ['circle', 'triangle', 'polygon'],
      },
      size: {
        value: { min: 1, max: 5 },
        random: true,
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.1,
        },
      },
    },
    detectRetina: true,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const features = [
    {
      icon: BrainIcon,
      title: 'Advanced AI',
      description: 'Powered by cutting-edge GPT technology',
      color: '#10a37f'
    },
    {
      icon: ZapIcon,
      title: 'Lightning Fast',
      description: 'Real-time streaming responses',
      color: '#f59e0b'
    },
    {
      icon: MessageSquareIcon,
      title: 'Natural Conversations',
      description: 'Human-like interaction experience',
      color: '#6366f1'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="animated-homepage">
      {/* Particles Background */}
      <div className="particles-container">
        <Particles
          id="particles"
          init={particlesInit}
          options={particlesConfig}
        />
      </div>

      {/* Animated Background Gradients */}
      <div className="gradient-bg">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        ref={ref}
      >
        <div className="hero-content">
          {/* Logo Animation */}
          <motion.div
            className="logo-container"
            variants={floatingVariants}
            animate="animate"
          >
            <div className="sigma-logo-large">
              <div className="logo-circle-large">
                <span className="sigma-symbol-large">Σ</span>
                <div className="logo-pulse"></div>
                <div className="logo-ring"></div>
              </div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div variants={itemVariants} className="hero-title">
            <h1>
              <span className="title-line">Welcome to</span>
              <span className="title-main">
                <span className="text-gradient">Sigma</span>GPT
              </span>
              <motion.div
                className="title-underline"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.5, duration: 0.8 }}
              ></motion.div>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants} className="hero-subtitle">
            <p>
              Experience the future of AI conversation with real-time streaming,
              <br />
              advanced language understanding, and human-like interactions.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="hero-buttons">
            <motion.button
              className="cta-primary"
              onClick={onStartChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Chatting</span>
              <ArrowRightIcon size={20} />
              <div className="button-glow"></div>
            </motion.button>
            
            <motion.button
              className="cta-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SparklesIcon size={20} />
              <span>Explore Features</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Feature Cards */}
        <div className="floating-features">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={floatingVariants}
              animate="animate"
              style={{
                animationDelay: `${index * 0.5}s`,
                '--feature-color': feature.color
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className="feature-icon">
                <feature.icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-glow"></div>
            </motion.div>
          ))}
        </div>

        {/* Animated Stats */}
        <motion.div
          className="stats-container"
          variants={itemVariants}
        >
          <div className="stat-item">
            <motion.div
              className="stat-number"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              <CountingNumber end={99} duration={2} />%
            </motion.div>
            <div className="stat-label">Accuracy</div>
          </div>
          
          <div className="stat-item">
            <motion.div
              className="stat-number"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              <CountingNumber end={24} duration={2} />/7
            </motion.div>
            <div className="stat-label">Available</div>
          </div>
          
          <div className="stat-item">
            <motion.div
              className="stat-number"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }}
            >
              &lt;<CountingNumber end={1} duration={2} />s
            </motion.div>
            <div className="stat-label">Response Time</div>
          </div>
        </motion.div>
      </motion.div>


    </div>
  );
};

// Counting Number Component
const CountingNumber = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const increment = end / (duration * 60);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(counter);
    }, 2000);

    return () => clearTimeout(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

export default AnimatedHomepage;