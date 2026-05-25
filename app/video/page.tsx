'use client';

import { useState, useMemo } from 'react';
import {
  Play,
  Clock,
  Eye,
  Download,
  Share2,
  Star,
  Search,
  FileText,
  Package,
  BookOpen,
  Zap,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// تعريف الأنواع (Interfaces) بشكل يتقبل الداتا القديمة والجديدة
interface Material {
  name: string;
  url: string;
}

interface Video {
  id: number;
  title: string;
  instructor: string;
  uploadDate: string;
  views: number;
  rating: number;
  duration: string;
  format: string;
  resolution: string;
  fileSize: string;
  description: string;
  quality: string[];
  materials: (string | Material)[]; // يقبل نصوص عادية أو روابط تحميل
  tags: string[];
  thumbnail: string;
  videoUrl: string;
  downloadUrl?: string; // رابط التحميل المباشر لملف الـ MP4 لو وجد
}

// الداتا المبدئية (Dummy Data)
const videos: Video[] = [
  {
    id: 1,
    title: 'React Performance Optimization - Advanced Patterns',
    instructor: 'Dr. Sarah',
    uploadDate: 'January 15, 2024',
    views: 12540,
    rating: 4.8,
    duration: '1:15:00',
    format: 'MP4 • H.264',
    resolution: '4K (2160p)',
    fileSize: '2.8GB',
    description:
      'Learn advanced techniques for optimizing React applications. We cover memoization, lazy loading, code splitting, and profiling tools. This comprehensive course includes practical examples and real-world scenarios.',
    quality: ['480p', '720p', '1080p', '2160p'],
    materials: [
      { name: 'Lecture Slides (PDF)', url: '/dummy-path/slides.pdf' },
      { name: 'Source Code (ZIP)', url: '/dummy-path/code.zip' },
      { name: 'Study Guide', url: '/dummy-path/guide.pdf' },
      { name: 'Practice Exercises', url: '/dummy-path/exercises.pdf' },
    ],
    tags: ['React', 'Performance', 'Optimization', 'Advanced'],
    thumbnail: 'https://images.unsplash.com/photo-1633356713697-d78c2dc52f8d?w=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/AZ9i3eoyrnE',
    downloadUrl: '#',
  },
  {
    id: 2,
    title: 'Advanced State Management',
    instructor: 'Prof. Esraa',
    uploadDate: 'January 10, 2024',
    views: 8300,
    rating: 4.7,
    duration: '2:15:00',
    format: 'MP4 • H.264',
    resolution: '1080p',
    fileSize: '1.5GB',
    description: 'Master state management with Redux, Context API, and Zustand.',
    quality: ['720p', '1080p'],
    materials: ['Lecture Slides (PDF)', 'Source Code (ZIP)', 'Study Guide'], // الداتا القديمة (نصوص)
    tags: ['State Management', 'Redux', 'Advanced'],
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 3,
    title: 'Performance Optimization',
    instructor: 'Dr. Sarah',
    uploadDate: 'December 28, 2023',
    views: 15200,
    rating: 4.9,
    duration: '1:30:45',
    format: 'MP4 • H.264',
    resolution: '4K (2160p)',
    fileSize: '3.2GB',
    description: 'Complete guide to web performance optimization.',
    quality: ['1080p', '2160p'],
    materials: ['Lecture Slides (PDF)', 'Source Code (ZIP)', 'Practice Exercises'],
    tags: ['Performance', 'Optimization', 'Web'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f70a504f8?w=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 4,
    title: 'TypeScript Masterclass',
    instructor: 'Dr. Sarah',
    uploadDate: 'December 20, 2023',
    views: 9700,
    rating: 4.6,
    duration: '3:00:00',
    format: 'MP4 • H.264',
    resolution: '1080p',
    fileSize: '2.1GB',
    description: 'Deep dive into TypeScript for professional development.',
    quality: ['720p', '1080p'],
    materials: ['Lecture Slides (PDF)', 'Source Code (ZIP)'],
    tags: ['TypeScript', 'JavaScript', 'Advanced'],
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-2e88f1514444?w=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 5,
    title: 'Next.js 15 Complete Guide',
    instructor: 'Dr. Sarah',
    uploadDate: 'December 15, 2023',
    views: 22100,
    rating: 4.9,
    duration: '2:45:30',
    format: 'MP4 • H.264',
    resolution: '4K (2160p)',
    fileSize: '3.5GB',
    description: 'Master Next.js 15 with all latest features and best practices.',
    quality: ['1080p', '2160p'],
    materials: ['Lecture Slides (PDF)', 'Source Code (ZIP)', 'Study Guide', 'Practice Exercises'],
    tags: ['Next.js', 'React', 'Full-Stack'],
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 6,
    title: 'Testing Best Practices',
    instructor: 'Dr. Sarah',
    uploadDate: 'December 10, 2023',
    views: 6800,
    rating: 4.5,
    duration: '1:50:00',
    format: 'MP4 • H.264',
    resolution: '1080p',
    fileSize: '1.8GB',
    description: 'Write better tests with Jest, React Testing Library, and more.',
    quality: ['720p', '1080p'],
    materials: ['Lecture Slides (PDF)', 'Source Code (ZIP)'],
    tags: ['Testing', 'Jest', 'Quality Assurance'],
    thumbnail: 'https://images.unsplash.com/photo-1633356713697-d78c2dc52f8d?w=800&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

// دالة ذكية ومحمية لجلب الأيقونات
const getResourceIcon = (name?: string) => {
  if (!name || typeof name !== 'string') return <Download className="w-5 h-5" />;
  
  if (name.includes('PDF')) return <FileText className="w-5 h-5" />;
  if (name.includes('ZIP') || name.includes('Code')) return <Package className="w-5 h-5" />;
  if (name.includes('Guide')) return <BookOpen className="w-5 h-5" />;
  if (name.includes('Practice')) return <Zap className="w-5 h-5" />;
  
  return <Download className="w-5 h-5" />;
};

export default function VideoPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | undefined>(videos[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'transcript'>('description');

  const filteredVideos = useMemo(() => {
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const currentVideo = selectedVideo;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  // وظيفة المشاركة (Share)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentVideo?.title,
          text: `Check out this course: ${currentVideo?.title} by ${currentVideo?.instructor}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Video Library</h1>
            <p className="text-lg text-gray-600">Professional learning materials and recorded sessions</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl h-12 text-base focus:border-red-800"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100">
              <div className="aspect-video bg-black relative group">
                {currentVideo && (
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentVideo.videoUrl}
                    title={currentVideo.title}
                    frameBorder="0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Quality */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700 bg-red-100 px-3 py-1 rounded-full">
                      {videoQuality}
                    </span>
                    <div className="flex gap-2">
                      {currentVideo?.quality?.map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setVideoQuality(quality)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                            videoQuality === quality
                              ? 'bg-red-800 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {currentVideo?.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentVideo?.title}</h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center text-white font-bold text-sm">
                      {currentVideo?.instructor.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{currentVideo?.instructor}</p>
                      <p className="text-xs text-gray-500">Instructor</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {renderStars(currentVideo?.rating || 0)}
                    <span className="text-sm font-semibold text-gray-700 ml-2">
                      ({currentVideo?.rating})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{currentVideo?.views.toLocaleString()} views</span>
                  </div>

                  <div className="text-sm text-gray-500">{currentVideo?.uploadDate}</div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 flex-wrap mb-8">
                  <Button
                    onClick={() => setLiked(!liked)}
                    className="bg-red-800 hover:bg-red-900 text-white font-semibold px-6 py-2 rounded-xl"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Liked' : 'Like'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                    onClick={() => {
                      if (currentVideo?.downloadUrl && currentVideo.downloadUrl !== '#') {
                        window.open(currentVideo.downloadUrl, '_blank');
                      } else {
                        alert("عذراً، لا يمكن تحميل الفيديوهات من يوتيوب مباشرة. يرجى توفير رابط MP4 مباشر.");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Tabs */}
                <div className="border-b-2 border-gray-200">
                  <div className="flex gap-8">
                    {(['description', 'materials', 'transcript'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 text-sm font-semibold capitalize transition-all relative ${
                          activeTab === tab ? 'text-red-800' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800 rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="pt-8">
                  {activeTab === 'description' && (
                    <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                      {currentVideo?.description}
                    </p>
                  )}
                  {activeTab === 'materials' && (
                    <div className="space-y-3">
                      {currentVideo?.materials?.map((material, index) => {
                        const materialName = typeof material === 'string' ? material : material.name;
                        const materialUrl = typeof material === 'string' ? '#' : material.url;

                        return (
                          <a
                            key={index}
                            href={materialUrl}
                            download={materialUrl !== '#'}
                            className="flex items-center justify-between bg-red-50 border-2 border-gray-200 rounded-xl p-4 hover:border-red-800 hover:shadow-md transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-red-800 group-hover:text-red-900 transition-colors">
                                {getResourceIcon(materialName)}
                              </div>
                              <span className="text-gray-800 font-semibold">{materialName}</span>
                            </div>
                            <Download className="w-5 h-5 text-red-800 group-hover:text-red-900 transition-all" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                  {activeTab === 'transcript' && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                      <p className="text-gray-700 text-base">
                        Transcript will be available after video completion.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Related Videos</h3>
              <p className="text-sm text-gray-600">Continue learning with these modules</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg max-h-[700px] overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group ${
                      selectedVideo?.id === video.id
                        ? 'bg-red-50 border-red-400 shadow-md'
                        : 'bg-white border-gray-200 hover:border-red-200'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-14 rounded-lg bg-gray-300 flex-shrink-0 flex items-center justify-center border border-gray-300 overflow-hidden relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-800 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{video.instructor}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white sticky bottom-0 border-t border-gray-100">
                <Button className="w-full bg-red-800 hover:bg-red-900 text-white font-semibold py-3 rounded-xl text-base flex items-center justify-center">
                  View All Courses
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}