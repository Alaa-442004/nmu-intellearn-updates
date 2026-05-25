"use client";

import { Navbar } from "@/components/navigation/navbar";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { ArrowRight, BookOpen, Award, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Adaptive AI-Driven Journeys",
    description: "Our core engine continuously maps individual progress tracking metrics to generate hyper-personalized paths that accelerate comprehension.",
  },
  {
    icon: Users,
    title: "Secure Enterprise Examinations",
    description: "Deploy rigorously integrity-protected exams alongside holistic evaluation architectures designed for strict organizational benchmarks.",
  },
  {
    icon: Award,
    title: "Verifiable Career Credentials",
    description: "Transform academic milestones into immediate professional growth with secure digital certifications instantly recognized by industry leaders.",
  },
];

export default function Home() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-foreground">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Text Section */}
              <m.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Advanced{" "}
                  <span className="text-primary">AI-Powered</span> Learning Platform
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                  Transform your professional development with our comprehensive
                  learning, examination, and digital certification system.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/login"
                    className={cn(
                      "inline-flex items-center justify-center px-6 py-3",
                      "bg-primary text-white rounded-lg font-semibold",
                      "hover:bg-primary-dark transition-colors",
                      "shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>

                  <Link
                    href="/courses"
                    className={cn(
                      "inline-flex items-center justify-center px-6 py-3",
                      "bg-card-light dark:bg-card-dark border-2 border-primary text-primary rounded-lg font-semibold",
                      "hover:bg-primary hover:text-white transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    Browse Courses
                  </Link>
                </div>
              </m.div>

              {/* Image Section */}
              <m.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className="relative z-10 bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl overflow-hidden h-[400px] sm:h-[500px]">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/undraw_online-learning_tgmv.png"
                      alt="Learning Platform Illustration"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </m.div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card-light dark:bg-card-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* تم تغيير motion.div هنا إلى m.div لتتوافق مع الـ LazyMotion */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Engineered for Intelligent Education
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover a premium ecosystem built to optimize organizational performance, instructional delivery, and student career trajectories.
              </p>
            </m.div>

            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  // تم تغيير motion.div هنا أيضاً إلى m.div ليعمل الأنيميشن بشكل سليم وسريع
                  <m.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-background-light dark:bg-background-dark p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </m.div>
                );
              })}
            </div>

          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              &copy; {new Date().getFullYear()} NMU IntelliLearn Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}