import React from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const promptText = `为我生成图中角色的绘制 Q 版的，LINE 风格的半身像表情包，注意头饰要正确
彩色手绘风格，使用 4x6 布局，涵盖各种各样的常用聊天语句，或是一些有关的娱乐 meme
其他需求：不要原图复制，所有标注为手写简体中文，中文文字横向或者纵向随机排列，
生成的图片需为 4K 分辨率 16:9`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-apple-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-apple-gray/50 flex items-center justify-center border border-apple-border/40">
              <Sparkles size={20} className="text-apple-text" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-apple-text">表情包生成教程</h2>
              <p className="text-xs text-apple-subtext">AI 提示词参考</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-apple-gray transition-colors flex items-center justify-center"
          >
            <X size={18} className="text-apple-subtext" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Prompt Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-apple-text">Prompt 提示词</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-apple-blue text-white text-xs font-medium hover:bg-apple-hoverBlue transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    复制
                  </>
                )}
              </button>
            </div>
            <div className="bg-apple-gray/50 rounded-2xl p-4 border border-apple-border/40">
              <pre className="text-xs text-apple-text whitespace-pre-wrap font-mono leading-relaxed">
                {promptText}
              </pre>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-apple-text mb-3">使用教学</h3>
            <p className="text-sm text-apple-text leading-relaxed">
              直接拿一张图片当底图，输入上面的 Prompt 就可以了。或者你可以微调一下，比如文字随机横向/竖向排列，比例 1:1 等等。生成后上传到本工具，使用 4×6 布局切割即可。
            </p>
          </div>

          {/* Tips */}
          <div className="bg-apple-gray/30 rounded-2xl p-4 border border-apple-border/40">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-apple-subtext flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-apple-text mb-1">提示</h4>
                <p className="text-xs text-apple-subtext leading-relaxed">
                  推荐使用 Midjourney、DALL-E 3 或其他 AI 图像生成工具。生成的图片建议为 4K 分辨率 16:9 比例，这样切割后的每个表情包质量更高。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
