"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Settings,
  Key,
  Bell,
  Lock,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils/cn";

const adminProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string(),
  department: z.string().optional(),
});

type AdminProfileFormData = z.infer<typeof adminProfileSchema>;

const mockAdminProfile = {
  name: "Ahmed Al-Mansouri",
  email: "admin@knowledgejudge.com",
  phone: "+966 50 123 4567",
  role: "Super Admin",
  department: "IT & Development",
  joinDate: "January 2022",
  lastLogin: "Today at 10:30 AM",
  permissions: [
    "Manage Courses",
    "Manage Exams",
    "Manage Students",
    "View Reports",
    "Manage Payments",
    "System Settings",
  ],
  stats: {
    totalActions: 1250,
    coursesCreated: 45,
    examsCreated: 320,
    studentsManaged: 2450,
  },
};

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "settings">("profile");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminProfileFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: mockAdminProfile.name,
      email: mockAdminProfile.email,
      phone: mockAdminProfile.phone,
      role: mockAdminProfile.role,
      department: mockAdminProfile.department,
    },
  });

  const onSubmit = async (data: AdminProfileFormData) => {
    console.log("Admin profile updated:", data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your admin account and settings
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg font-semibold",
                  "bg-primary text-white hover:bg-primary-dark transition-colors"
                )}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-card-light dark:bg-card-dark p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            {[
              { id: "profile" as const, label: "Profile", icon: User },
              { id: "security" as const, label: "Security", icon: Lock },
              { id: "settings" as const, label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card-light dark:bg-card-dark rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20">
                      <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {mockAdminProfile.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-1">
                        {mockAdminProfile.role}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Admin since {mockAdminProfile.joinDate}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            {...register("name")}
                            type="text"
                            className={cn(
                              "w-full px-4 py-3 rounded-lg border",
                              "bg-background-light dark:bg-background-dark",
                              "border-gray-300 dark:border-gray-600",
                              "focus:ring-2 focus:ring-primary focus:border-transparent",
                              errors.name && "border-error"
                            )}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-error">
                              {errors.name.message}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-background-light dark:bg-background-dark rounded-lg">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <span>{mockAdminProfile.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      {isEditing ? (
                        <>
                          <input
                            {...register("email")}
                            type="email"
                            className={cn(
                              "w-full px-4 py-3 rounded-lg border",
                              "bg-background-light dark:bg-background-dark",
                              "border-gray-300 dark:border-gray-600",
                              "focus:ring-2 focus:ring-primary focus:border-transparent",
                              errors.email && "border-error"
                            )}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-error">
                              {errors.email.message}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-background-light dark:bg-background-dark rounded-lg">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <span>{mockAdminProfile.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      {isEditing ? (
                        <input
                          {...register("phone")}
                          type="tel"
                          className={cn(
                            "w-full px-4 py-3 rounded-lg border",
                            "bg-background-light dark:bg-background-dark",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-2 focus:ring-primary focus:border-transparent"
                          )}
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-background-light dark:bg-background-dark rounded-lg">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <span>{mockAdminProfile.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      {isEditing ? (
                        <input
                          {...register("role")}
                          type="text"
                          disabled
                          className={cn(
                            "w-full px-4 py-3 rounded-lg border",
                            "bg-gray-100 dark:bg-gray-800",
                            "border-gray-300 dark:border-gray-600",
                            "cursor-not-allowed"
                          )}
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-background-light dark:bg-background-dark rounded-lg">
                          <Shield className="w-5 h-5 text-gray-400 mr-3" />
                          <span>{mockAdminProfile.role}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Department</label>
                      {isEditing ? (
                        <input
                          {...register("department")}
                          type="text"
                          className={cn(
                            "w-full px-4 py-3 rounded-lg border",
                            "bg-background-light dark:bg-background-dark",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-2 focus:ring-primary focus:border-transparent"
                          )}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-background-light dark:bg-background-dark rounded-lg">
                          <span>{mockAdminProfile.department}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className={cn(
                          "px-6 py-2 rounded-lg font-semibold",
                          "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700",
                          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        )}
                      >
                        <X className="w-4 h-4 inline mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={cn(
                          "px-6 py-2 rounded-lg font-semibold",
                          "bg-primary text-white hover:bg-primary-dark transition-colors"
                        )}
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Actions",
                    value: mockAdminProfile.stats.totalActions.toLocaleString(),
                    icon: Settings,
                    color: "text-blue-500",
                    bgColor: "bg-blue-500/10",
                  },
                  {
                    label: "Courses Created",
                    value: mockAdminProfile.stats.coursesCreated,
                    icon: Calendar,
                    color: "text-primary",
                    bgColor: "bg-primary/10",
                  },
                  {
                    label: "Exams Created",
                    value: mockAdminProfile.stats.examsCreated,
                    icon: Key,
                    color: "text-accent",
                    bgColor: "bg-accent/10",
                  },
                  {
                    label: "Students Managed",
                    value: mockAdminProfile.stats.studentsManaged.toLocaleString(),
                    icon: User,
                    color: "text-success",
                    bgColor: "bg-success/10",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className={cn(
                      "bg-card-light dark:bg-card-dark rounded-xl p-6",
                      "border border-gray-200 dark:border-gray-700",
                      "shadow-lg"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                        stat.bgColor
                      )}
                    >
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Permissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Permissions
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {mockAdminProfile.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center p-3 bg-background-light dark:bg-background-dark rounded-lg"
                    >
                      <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                      <span className="text-sm font-medium">{permission}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Last Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Last Login
                    </p>
                    <p className="font-semibold">{mockAdminProfile.lastLogin}</p>
                  </div>
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border",
                        "bg-background-light dark:bg-background-dark",
                        "border-gray-300 dark:border-gray-600",
                        "focus:ring-2 focus:ring-primary focus:border-transparent"
                      )}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border",
                        "bg-background-light dark:bg-background-dark",
                        "border-gray-300 dark:border-gray-600",
                        "focus:ring-2 focus:ring-primary focus:border-transparent"
                      )}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border",
                        "bg-background-light dark:bg-background-dark",
                        "border-gray-300 dark:border-gray-600",
                        "focus:ring-2 focus:ring-primary focus:border-transparent"
                      )}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    className={cn(
                      "px-6 py-2 rounded-lg font-semibold",
                      "bg-primary text-white hover:bg-primary-dark transition-colors"
                    )}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">2FA Status</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Two-factor authentication is currently disabled
                    </p>
                  </div>
                  <button
                    className={cn(
                      "px-4 py-2 rounded-lg font-semibold",
                      "bg-primary text-white hover:bg-primary-dark transition-colors"
                    )}
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: "Email Notifications", enabled: true },
                    { label: "SMS Notifications", enabled: false },
                    { label: "Push Notifications", enabled: true },
                    { label: "Weekly Reports", enabled: true },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg"
                    >
                      <span className="font-medium">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.enabled}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">System Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg">
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        English (US)
                      </p>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark">
                      <option>English</option>
                      <option>Arabic</option>
                      <option>Italian</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg">
                    <div>
                      <p className="font-medium">Time Zone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        GMT+3 (Riyadh)
                      </p>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark">
                      <option>GMT+3 (Riyadh)</option>
                      <option>GMT+0 (London)</option>
                      <option>GMT-5 (New York)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
  );
}
