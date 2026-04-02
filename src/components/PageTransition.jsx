import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 8,
        scale: 0.99,
        filter: "blur(4px)"
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 0.99,
        filter: "blur(4px)",
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function PageTransition({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            className="w-full min-h-screen"
        >
            {children}
        </motion.div>
    );
}
