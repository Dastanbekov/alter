"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Clock, Image as ImageIcon, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { ScheduleModal } from "./ScheduleModal";
import type { GeneratedPostItem, Workspace } from "@/types";

interface Props {
  post: GeneratedPostItem;
  workspace: Workspace;
  onClose: () => void;
  onUpdate: (content: string, mediaUrls?: string[]) => void;
}

export function LinkedInPostPreviewModal({ post, workspace, onClose, onUpdate }: Props) {
  const [content, setContent] = useState(post.content);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [mediaList, setMediaList] = useState<string[]>(post.mediaUrls || []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLongText = content.split('\n').length > 4 || content.length > 210;

  const getTruncatedContent = (text: string) => {
    const lines = text.split('\n');
    if (lines.length > 4) {
      return lines.slice(0, 4).join('\n').slice(0, 180);
    }
    return text.slice(0, 210);
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [content, isExpanded]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newB64s = await Promise.all(newFiles.map(f => getBase64(f)));
      const updatedMedia = [...mediaList, ...newB64s];
      setMediaList(updatedMedia);

      onUpdate(content, updatedMedia);
    }
  };

  const removeImage = async (index: number) => {
    const updatedMedia = mediaList.filter((_, i) => i !== index);
    setMediaList(updatedMedia);

    onUpdate(content, updatedMedia);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const isConnected = workspace.socials.some(s => s.platform === "linkedin");

  const handlePublish = async () => {
    if (!isConnected) {
      toast.error(`Please connect LinkedIn first in Settings`);
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          platform: "linkedin",
          content,
          images: mediaList,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to post");
        return;
      }

      setPublished(true);
      toast.success("Posted to LinkedIn!");
      onUpdate(content);
      setTimeout(onClose, 2000);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 sm:p-6" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-[552px] rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - LinkedIn Style */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-[16px] font-semibold text-black">Preview LinkedIn Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-[#f3f2ef]">
          <div className="bg-white my-4 mx-0 sm:mx-4 rounded-lg shadow-sm border border-gray-200">
            {/* Post Header */}
            <div className="flex items-start gap-3 px-4 pt-4 pb-1">
              <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-500 font-bold text-xl overflow-hidden">
                {workspace.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[14px] text-black hover:text-[#0a66c2] hover:underline cursor-pointer">
                    {workspace.name}
                  </span>
                  <span className="text-gray-500 text-[14px]">• 1st</span>
                </div>
                <span className="text-[12px] text-gray-500 line-clamp-1">
                  {workspace.details || "Building something amazing"}
                </span>
                <div className="flex items-center gap-1 text-[12px] text-gray-500">
                  <span>Just now</span>
                  <span>•</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M8 1a7 7 0 107 7 7.008 7.008 0 00-7-7zM6.63 13.85a5.52 5.52 0 01-1.39-4.22h-3.7A5.51 5.51 0 006.63 13.85zM5.24 8.13H1.54a5.52 5.52 0 013.7-4.22zm2.14 5.86a7.21 7.21 0 002.39-3.21H6.18A7.21 7.21 0 008.57 14zm.64-4.71h-2.3a5.54 5.54 0 01-2.12-2.66h6.54a5.54 5.54 0 01-2.12 2.66zm.26-4.16H4.79A5.54 5.54 0 016.91 2.47h2.3a5.54 5.54 0 012.12 2.66zM10.76 8.13a5.52 5.52 0 01-1.39 4.22h3.7a5.51 5.51 0 00-2.31-4.22zm-1.39-1.5H14.46a5.52 5.52 0 00-3.7-4.22z"></path></svg>
                </div>
              </div>
            </div>

            {/* Post Text Body */}
            <div className="px-4 py-2">
              {!isExpanded && isLongText ? (
                <div 
                  className="w-full text-[14px] text-black leading-[1.5] whitespace-pre-wrap font-sans cursor-text"
                  onClick={() => setIsExpanded(true)}
                >
                  {getTruncatedContent(content)}
                  <span className="text-gray-500">...</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="text-gray-500 hover:text-[#0a66c2] hover:underline ml-1"
                  >
                    see more
                  </button>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-[14px] text-black leading-[1.5] resize-none outline-none border-none p-0 focus:ring-0 whitespace-pre-wrap font-sans bg-transparent"
                  placeholder="What do you want to talk about?"
                  autoFocus={isExpanded}
                />
              )}
            </div>

            {/* LinkedIn Style Image Grid */}
            {mediaList.length > 0 && (
              <div className="w-full relative mt-2 group">
                <div className={`grid gap-0.5 ${mediaList.length === 1 ? 'grid-cols-1' : mediaList.length === 2 ? 'grid-cols-2' : mediaList.length === 3 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2 grid-rows-2'}`}>
                  {mediaList.slice(0, 4).map((url, i) => (
                    <div 
                      key={i} 
                      className={`relative bg-gray-100 border border-gray-200 overflow-hidden ${
                        mediaList.length === 3 && i === 0 ? 'row-span-2' : ''
                      }`}
                    >
                      <img 
                        src={url.startsWith('data:') || url.startsWith('blob:') ? url : `data:image/jpeg;base64,${url}`}
                        alt="Preview" 
                        className="w-full h-full object-cover max-h-[400px]" 
                      />
                      {!published && (
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {mediaList.length > 4 && i === 3 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-2xl font-semibold">
                          +{mediaList.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Recommendations */}
            {post.imageRecommendations && post.imageRecommendations.length > 0 && (
              <div className="mt-4 px-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <ImageIcon size={14} className="text-[#1a7352]" />
                  <span className="text-[12px] font-semibold text-[#1a7352]">
                    AI Image Recommendations
                  </span>
                </div>
                <ul className="space-y-2">
                  {post.imageRecommendations.map((rec, idx) => (
                    <li key={idx} className="text-[13px] text-gray-600 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#1a7352]/10 text-[#1a7352] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              title="Add media"
            >
              <ImageIcon size={22} />
            </button>
          </div>

          <div className="flex justify-end gap-3">
            {published ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold text-[14px]">
                <Check size={18} /> Submitted
              </div>
            ) : (
              <>
                <button
                onClick={() => setShowSchedule(true)}
                className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-gray-400 hover:bg-gray-100 hover:border-gray-500 font-semibold text-gray-600 transition-colors"
              >
                <Clock size={16} /> Schedule
              </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !content.trim()}
                  className="px-5 py-2 rounded-full bg-[#0a66c2] text-white font-semibold text-[15px] hover:bg-[#004182] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {publishing ? <div className="spinner w-4 h-4 border-white" /> : <><Send size={16} /> Post</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showSchedule && (
        <ScheduleModal
          post={{ ...post, content, platform: "linkedin" }}
          images={mediaList}
          workspace={workspace}
          onClose={() => setShowSchedule(false)}
          onScheduled={() => {
            setShowSchedule(false);
            setPublished(true);
            onUpdate(content);
            setTimeout(onClose, 2000);
          }}
        />
      )}
    </div>
  );
}
