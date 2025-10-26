import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, MessageSquare, Bot } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onStartChat }) => {
  const features = [
    {
      icon: <Sparkles size={24} />,
      title: 'Powered by Gemini 2.5 Flash',
      description: 'Latest AI technology for lightning-fast responses'
    },
    {
      icon: <Zap size={24} />,
      title: 'Real-time Streaming',
      description: 'See responses generated word by word'
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Natural Conversations',
      description: 'Context-aware chat that remembers your conversation'
    },
    {
      icon: <Bot size={24} />,
      title: 'Advanced AI',
      description: 'Intelligent responses powered by Google Gemini'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="landing-container"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      variants={containerVariants}
    >
      <div className="landing-content">
        <motion.div className="logo-container" variants={itemVariants}>
          <div className="logo-glow"></div>
          <h1 className="logo-text">
            <span className="logo-sigma">Σ</span>
            <span className="logo-gpt">SigmaGPT</span>
          </h1>
        </motion.div>

        <motion.p className="subtitle" variants={itemVariants}>
          Experience the future of AI conversation
        </motion.p>

        <motion.button
          className="start-button"
          onClick={onStartChat}
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="button-icon" size={20} />
          Start Chatting
          <div className="button-glow"></div>
        </motion.button>

        <motion.div className="features-grid" variants={containerVariants}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-glow"></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="footer-text" variants={itemVariants}>
          <p>Powered by Google Gemini 2.5 Flash • Built with React</p>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>
    </motion.div>
  );
};

export default LandingPage;
