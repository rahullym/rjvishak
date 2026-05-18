"use client";

import { useRef } from "react";
import type { Editor } from "@tiptap/react";

interface Props {
    editor: Editor | null;
}

function Btn({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-pressed={active}
            className={`h-9 min-w-9 px-2 rounded-md text-sm font-medium transition flex items-center justify-center
                ${active ? "bg-[var(--color-slate-blue)] text-white" : "text-gray-600 hover:bg-gray-100"}
                disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="w-px h-5 bg-gray-200 mx-1" />;
}

export default function EditorToolbar({ editor }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);

    if (!editor) return null;

    async function uploadImage(file: File) {
        if (!editor) return;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data?.error || `Upload failed (${res.status})`);
            return;
        }
        const { url } = (await res.json()) as { url: string };
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    }

    function promptLink() {
        if (!editor) return;
        const prev = editor.getAttributes("link").href;
        const url = window.prompt("Link URL (empty to remove):", prev || "https://");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
            <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                ↶
            </Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                ↷
            </Btn>
            <Divider />

            <Btn
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
            >
                H1
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
            >
                H2
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive("heading", { level: 3 })}
                title="Heading 3"
            >
                H3
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().setParagraph().run()}
                active={editor.isActive("paragraph")}
                title="Paragraph"
            >
                ¶
            </Btn>
            <Divider />

            <Btn
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
                title="Bold (⌘B)"
            >
                <strong>B</strong>
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
                title="Italic (⌘I)"
            >
                <em>I</em>
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")}
                title="Strikethrough"
            >
                <span className="line-through">S</span>
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive("code")}
                title="Inline code"
            >
                {"</>"}
            </Btn>
            <Divider />

            <Btn
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
                title="Bulleted list"
            >
                •
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
                title="Numbered list"
            >
                1.
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive("blockquote")}
                title="Blockquote"
            >
                ❝
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive("codeBlock")}
                title="Code block"
            >
                {"{}"}
            </Btn>
            <Btn
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal rule"
            >
                —
            </Btn>
            <Divider />

            <Btn onClick={promptLink} active={editor.isActive("link")} title="Link">
                🔗
            </Btn>
            <Btn onClick={() => fileRef.current?.click()} title="Upload image">
                🖼
            </Btn>
            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(f);
                    e.currentTarget.value = "";
                }}
            />
        </div>
    );
}
