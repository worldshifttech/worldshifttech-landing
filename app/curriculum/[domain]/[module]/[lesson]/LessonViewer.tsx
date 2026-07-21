"use client";

import { useState } from "react";
import Link from "next/link";

interface NavLesson {
  lesson_number: string;
  title: string;
  href: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lesson: any;
  isComplete: boolean;
  prevLesson: NavLesson | null;
  nextLesson: NavLesson | null;
  moduleHref: string;
}

// Renders inline text: handles **bold** and *italic*
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[#00205C] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-[#00205C]/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function renderContent(content: string): React.ReactNode[] {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Standalone section header: **Title** (whole block, no extra text)
    const headingMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
    if (headingMatch) {
      return (
        <h3 key={i} className="text-lg font-bold text-[#00205C] mt-8 mb-3 font-light">
          {headingMatch[1]}
        </h3>
      );
    }

    // Numbered list: every non-empty line starts with a digit
    const lines = trimmed.split("\n").filter(Boolean);
    if (
      lines.length > 1 &&
      lines.every((l) => /^\d+\./.test(l.trim()))
    ) {
      return (
        <ol key={i} className="space-y-3 my-4 pl-1">
          {lines.map((line, j) => {
            const text = line.replace(/^\d+\.\s*/, "");
            return (
              <li key={j} className="flex items-start gap-3 text-[#00205C]/85 text-base leading-relaxed font-normal">
                <span className="text-[#4B858E] font-bold flex-shrink-0 tabular-nums w-5 text-right">
                  {j + 1}.
                </span>
                <span>{renderInline(text)}</span>
              </li>
            );
          })}
        </ol>
      );
    }

    // Regular paragraph (with possible inline formatting and single \n)
    const withBreaks = trimmed.split("\n").map((line, j) => (
      <span key={j}>
        {renderInline(line)}
        {j < trimmed.split("\n").length - 1 && <br />}
      </span>
    ));
    return (
      <p key={i} className="text-[#00205C]/85 text-base leading-relaxed my-4 font-normal">
        {withBreaks}
      </p>
    );
  }).filter(Boolean) as React.ReactNode[];
}

export default function LessonViewer({
  lesson,
  isComplete: initialComplete,
  prevLesson,
  nextLesson,
  moduleHref,
}: Props) {
  const [complete, setComplete] = useState(initialComplete);
  const [marking, setMarking] = useState(false);

  async function handleMarkComplete() {
    if (complete || marking) return;
    setMarking(true);
    try {
      await fetch("/api/curriculum/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, status: "completed" }),
      });
      setComplete(true);
    } finally {
      setMarking(false);
    }
  }

  const aiPrompts: string[] = Array.isArray(lesson.ai_prompt_suggestions)
    ? lesson.ai_prompt_suggestions
    : [];

  return (
    <div>
      {/* Lesson header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-[#4B858E] bg-[#4B858E]/10 px-2 py-0.5 rounded">
            {lesson.lesson_number}
          </span>
          {lesson.estimated_time && (
            <span className="text-xs text-[#76777A]">{lesson.estimated_time}</span>
          )}
          {lesson.teaching_method && (
            <span className="text-xs text-[#76777A] hidden sm:block">
              {lesson.teaching_method}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] font-light">
          {lesson.title}
        </h1>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#4B858E]/20 mb-8" />

      {/* Core content */}
      <div className="mb-10">{renderContent(lesson.core_content)}</div>

      {/* Reflection prompt */}
      {lesson.reflection_prompt && (
        <div className="border-l-2 border-[#4B858E] pl-5 mb-10 bg-[#4B858E]/5 py-4 pr-4 rounded-r-xl">
          <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-3">
            Reflection
          </p>
          <p className="text-[#00205C]/80 text-sm leading-relaxed whitespace-pre-wrap font-normal">
            {lesson.reflection_prompt}
          </p>
        </div>
      )}

      {/* AI prompt suggestions */}
      {aiPrompts.length > 0 && (
        <div className="bg-white border border-[#00205C]/10 rounded-xl p-5 mb-10">
          <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-4">
            AI Prompt Suggestions
          </p>
          <p className="text-xs text-[#76777A] mb-4 font-normal">
            Copy any of these into Claude to deepen your learning.
          </p>
          <ul className="space-y-3">
            {aiPrompts.map((prompt, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-[#00205C]/75 leading-relaxed font-normal"
              >
                <span className="text-[#4B858E] flex-shrink-0 mt-0.5">›</span>
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key takeaway */}
      {lesson.key_takeaway && (
        <div className="border border-[#4B858E]/40 rounded-xl p-5 mb-10 bg-[#4B858E]/5">
          <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-3">
            Key Takeaway
          </p>
          <p className="text-[#00205C]/90 text-base leading-relaxed font-medium">
            {lesson.key_takeaway}
          </p>
        </div>
      )}

      {/* Mark complete + navigation */}
      <div className="border-t border-[#00205C]/[0.08] pt-8 mt-8">
        {/* Mark complete button */}
        <div className="mb-8">
          {complete ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#4B858E] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm text-[#4B858E] font-normal">
                Lesson complete
              </span>
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={marking}
              className="bg-[#4B858E] text-[#080C14] text-sm font-bold px-6 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {marking ? "Saving..." : "Mark Complete"}
            </button>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {prevLesson && (
              <Link href={prevLesson.href} className="group block">
                <p className="text-xs text-[#76777A] mb-1">Previous</p>
                <p className="text-sm text-[#00205C]/70 group-hover:text-[#4B858E] transition-colors font-normal">
                  ← {prevLesson.title}
                </p>
              </Link>
            )}
          </div>

          <div className="flex-1 text-right">
            {nextLesson ? (
              <Link href={nextLesson.href} className="group block">
                <p className="text-xs text-[#76777A] mb-1">Next</p>
                <p className="text-sm text-[#00205C]/70 group-hover:text-[#4B858E] transition-colors font-normal">
                  {nextLesson.title} →
                </p>
              </Link>
            ) : (
              <Link href={moduleHref} className="group block">
                <p className="text-xs text-[#76777A] mb-1">Done</p>
                <p className="text-sm text-[#00205C]/70 group-hover:text-[#4B858E] transition-colors font-normal">
                  Back to Module →
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
