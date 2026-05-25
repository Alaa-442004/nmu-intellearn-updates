"use client";

import { motion } from "framer-motion";

export default function AdminPaymentsPage() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card-light dark:bg-card-dark rounded-xl p-10 border border-gray-200 dark:border-gray-700 shadow-lg text-center"
        >
          <h1 className="text-3xl font-bold mb-4">Ready to start quiz</h1>
          <p className="text-gray-600 dark:text-gray-300">
            This section is now dedicated to quiz readiness instead of payments.
          </p>
        </motion.div>
  );
}
