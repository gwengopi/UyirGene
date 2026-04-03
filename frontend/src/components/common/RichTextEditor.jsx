import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddLinkIcon from '@mui/icons-material/AddLink';
import ImageIcon from '@mui/icons-material/Image';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HighlightIcon from '@mui/icons-material/Highlight';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

function ToolbarButton({ title, onClick, active, disabled, children }) {
  return (
    <Tooltip title={title} arrow>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: 1,
            color: active ? 'primary.main' : 'text.secondary',
            bgcolor: active ? 'primary.light' : 'transparent',
            '&:hover': { bgcolor: active ? 'primary.light' : 'action.hover' },
            mx: 0.2,
            p: 0.6,
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function RichTextEditor({ value, onChange, placeholder = 'Write your blog content here...', error, helperText }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external value into editor (needed when editing an existing blog loaded async)
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      // Only update if the editor content actually differs (avoids cursor reset on every keystroke)
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [editor, value]);

  const setHeading = useCallback((level) => {
    if (!editor) return;
    if (level === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: parseInt(level) }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkToLink({ href: url }).setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const getHeadingValue = () => {
    if (!editor) return 'paragraph';
    if (editor.isActive('heading', { level: 2 })) return '2';
    if (editor.isActive('heading', { level: 3 })) return '3';
    if (editor.isActive('heading', { level: 4 })) return '4';
    return 'paragraph';
  };

  if (!editor) return null;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '&:focus-within': {
          borderColor: error ? 'error.main' : 'primary.main',
          borderWidth: '2px',
        },
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.5,
          p: 0.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Undo / Redo */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <UndoIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <RedoIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Heading select */}
        <Select
          size="small"
          value={getHeadingValue()}
          onChange={(e) => setHeading(e.target.value)}
          sx={{ fontSize: 13, height: 30, minWidth: 110, mr: 0.5 }}
        >
          <MenuItem value="paragraph">Paragraph</MenuItem>
          <MenuItem value="2">Heading 2</MenuItem>
          <MenuItem value="3">Heading 3</MenuItem>
          <MenuItem value="4">Heading 4</MenuItem>
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Inline formatting */}
        <ToolbarButton title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <FormatUnderlinedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <StrikethroughSIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>
          <HighlightIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <CodeIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Alignment */}
        <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
          <FormatAlignLeftIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
          <FormatAlignCenterIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
          <FormatAlignRightIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Lists */}
        <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <FormatQuoteIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <HorizontalRuleIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Links & Media */}
        <ToolbarButton title="Insert Link" onClick={addLink} active={editor.isActive('link')}>
          <AddLinkIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Insert Image (URL)" onClick={addImage}>
          <ImageIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton title="Insert Table" onClick={insertTable}>
          <TableChartIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <FormatClearIcon fontSize="small" />
        </ToolbarButton>
      </Box>

      {/* Editor area */}
      <Box
        sx={{
          minHeight: 380,
          maxHeight: 600,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default',
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 340,
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'text.primary',
          },
          '& .ProseMirror p.is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)',
            float: 'left',
            color: 'text.disabled',
            pointerEvents: 'none',
            height: 0,
          },
          '& .ProseMirror h2': { fontSize: '1.6rem', fontWeight: 700, mt: 3, mb: 1.5, lineHeight: 1.3 },
          '& .ProseMirror h3': { fontSize: '1.3rem', fontWeight: 600, mt: 2.5, mb: 1 },
          '& .ProseMirror h4': { fontSize: '1.1rem', fontWeight: 600, mt: 2, mb: 0.8 },
          '& .ProseMirror ul, & .ProseMirror ol': { pl: 3, mb: 1.5 },
          '& .ProseMirror li': { mb: 0.5 },
          '& .ProseMirror blockquote': {
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            pl: 2,
            py: 0.5,
            my: 2,
            color: 'text.secondary',
            fontStyle: 'italic',
          },
          '& .ProseMirror hr': { border: 'none', borderTop: '2px solid', borderColor: 'divider', my: 3 },
          '& .ProseMirror code': {
            bgcolor: 'action.selected',
            px: 0.5,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '& .ProseMirror pre': {
            bgcolor: 'grey.900',
            color: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflowX: 'auto',
            my: 2,
            '& code': { bgcolor: 'transparent', color: 'inherit' },
          },
          '& .ProseMirror img': { maxWidth: '100%', borderRadius: 1, my: 1 },
          '& .ProseMirror a': { color: 'primary.main', textDecoration: 'underline' },
          '& .ProseMirror mark': { bgcolor: 'warning.light', borderRadius: 0.3, px: 0.3 },
          '& .ProseMirror table': {
            width: '100%',
            borderCollapse: 'collapse',
            my: 2,
            '& td, & th': {
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
              minWidth: 80,
              verticalAlign: 'top',
            },
            '& th': { bgcolor: 'action.selected', fontWeight: 700 },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Helper / error text */}
      {(helperText || error) && (
        <Box sx={{ px: 1.5, pb: 0.75, pt: 0.5, bgcolor: 'background.paper' }}>
          <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
            {error || helperText}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default RichTextEditor;
