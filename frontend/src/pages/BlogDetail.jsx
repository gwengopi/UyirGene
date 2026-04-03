import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  IconButton,
  alpha,
  useTheme,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Breadcrumb, LoadingSpinner, Button, SEO } from '../components/common';
import { articleSchema } from '../components/common/SEO';
import { blogService } from '../services';
import { formatDate } from '../utils/formatters';
import { getApiBaseUrl } from '../services/api';

const CATEGORY_COLORS = {
  'Research':          { bg: '#1565c0', light: '#e3f2fd' },
  'Tutorials':         { bg: '#2e7d32', light: '#e8f5e9' },
  'Industry Insights': { bg: '#6a1b9a', light: '#f3e5f5' },
  'News':              { bg: '#c62828', light: '#ffebee' },
  'Events':            { bg: '#e65100', light: '#fff3e0' },
  'Career Tips':       { bg: '#00695c', light: '#e0f2f1' },
  'Technology':        { bg: '#0277bd', light: '#e1f5fe' },
  'Health':            { bg: '#558b2f', light: '#f1f8e9' },
  'Education':         { bg: '#4527a0', light: '#ede7f6' },
  'Other':             { bg: '#37474f', light: '#eceff1' },
};

const TAG_PALETTE = [
  '#1565c0', '#2e7d32', '#6a1b9a', '#c62828',
  '#e65100', '#00695c', '#4527a0', '#37474f',
];

const FALLBACK_CATEGORIES = [
  'Research', 'Tutorials', 'Industry Insights', 'News',
  'Career Tips', 'Health', 'Education', 'Technology',
];

// Extract H2/H3 headings from HTML for table of contents
function extractHeadings(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const nodes = div.querySelectorAll('h2, h3');
  return Array.from(nodes).map((node, i) => ({
    id: `heading-${i}`,
    text: node.textContent,
    level: parseInt(node.tagName[1]),
  }));
}

// Inject IDs into headings so TOC links work
function injectHeadingIds(html) {
  let i = 0;
  return html.replace(/<h([23])[^>]*>/gi, (match) => {
    return match.replace('>', ` id="heading-${i++}">`);
  });
}

function sanitizeBlogContent(html) {
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'sandbox', 'id'],
  });
  const ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'player.vimeo.com', 'drive.google.com', 'docs.google.com'];
  return clean.replace(/<iframe[^>]*src=["']([^"']*)["'][^>]*>.*?<\/iframe>/gi, (match, src) => {
    try {
      const url = new URL(src);
      return ALLOWED_IFRAME_HOSTS.includes(url.hostname) ? match : '';
    } catch { return ''; }
  });
}

// ── SectionRenderer ──────────────────────────────────────────────────────────
function SectionRenderer({ section, catColor }) {
  const titleEl = section.title ? (
    <Typography
      variant="h5"
      fontWeight={700}
      sx={{ mt: 4, mb: 1.5, pb: 1, borderBottom: `3px solid ${catColor.bg}`, color: catColor.bg }}
    >
      {section.title}
    </Typography>
  ) : null;

  switch (section.type) {
    case 'intro':
    case 'text':
      return (
        <Box>
          {titleEl}
          <Typography variant="body1" sx={{ lineHeight: 1.9, fontSize: '1.05rem', mb: 2 }}>
            {section.content}
          </Typography>
        </Box>
      );

    case 'bullets':
      return (
        <Box>
          {titleEl}
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            {(section.items || []).map((item, i) => (
              <Box component="li" key={i} sx={{ mb: 0.75, lineHeight: 1.8, fontSize: '1.05rem' }}>
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      );

    case 'numbered':
      return (
        <Box>
          {titleEl}
          <Box component="ol" sx={{ pl: 3, mb: 2 }}>
            {(section.items || []).map((item, i) => (
              <Box component="li" key={i} sx={{ mb: 0.75, lineHeight: 1.8, fontSize: '1.05rem' }}>
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      );

    case 'callout':
      return (
        <Box>
          {titleEl}
          <Paper
            variant="outlined"
            sx={{
              borderLeft: `5px solid ${catColor.bg}`,
              borderRadius: '0 8px 8px 0',
              bgcolor: alpha(catColor.bg, 0.06),
              px: 2.5,
              py: 1.5,
              my: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.9, fontStyle: 'italic', color: 'text.secondary', fontSize: '1.05rem' }}
            >
              {section.content}
            </Typography>
          </Paper>
        </Box>
      );

    case 'table':
      return (
        <Box sx={{ my: 2, overflowX: 'auto' }}>
          {titleEl}
          <Table size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
            {section.headers && section.headers.length > 0 && (
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.selected' }}>
                  {section.headers.map((h, i) => (
                    <TableCell key={i} sx={{ fontWeight: 700, border: '1px solid', borderColor: 'divider' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {(section.rows || []).map((row, ri) => (
                <TableRow key={ri} sx={{ bgcolor: ri % 2 === 1 ? 'action.hover' : 'transparent' }}>
                  {(row || []).map((cell, ci) => (
                    <TableCell key={ci} sx={{ border: '1px solid', borderColor: 'divider', verticalAlign: 'top' }}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      );

    case 'faq':
      return (
        <Box>
          {titleEl}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {(section.items || []).map((item, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                  {item.question}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {item.answer}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      );

    case 'image':
      return (
        <Box sx={{ my: 3, textAlign: 'center' }}>
          {titleEl}
          {section.url && (
            <Box
              component="img"
              src={section.url}
              alt={section.caption || section.title || ''}
              sx={{ maxWidth: '100%', borderRadius: 2, display: 'block', mx: 'auto' }}
            />
          )}
          {section.caption && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {section.caption}
            </Typography>
          )}
        </Box>
      );

    default:
      return null;
  }
}

function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sidebarCategories, setSidebarCategories] = useState([]);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        let blogData;
        try { blogData = await blogService.getBlogBySlug(slug); }
        catch { blogData = await blogService.getBlog(slug); }
        setBlog(blogData);
        const recent = await blogService.getRecentBlogs();
        setRecentBlogs(recent.filter(b => b.id !== blogData.id).slice(0, 4));
      } catch {
        setError('Blog post not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadBlog();
  }, [slug]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await blogService.getCategoriesWithCount();
        if (Array.isArray(data) && data.length > 0) {
          setSidebarCategories(data.map(([name]) => name));
        }
      } catch {
        // fall back to hardcoded list
      }
    };
    loadCategories();
  }, []);

  const getBlogImage = (blogItem) => {
    if (blogItem?.featuredImage) return `${getApiBaseUrl()}/api/blogs/${blogItem.id}/image`;
    if (blogItem?.imageUrl) return blogItem.imageUrl;
    return null;
  };

  const parsedSections = useMemo(() => {
    if (!blog?.sections) return [];
    try { return JSON.parse(blog.sections); } catch { return []; }
  }, [blog?.sections]);

  const { sanitizedContent, headings } = useMemo(() => {
    if (parsedSections.length > 0) {
      // Build headings from section titles for TOC
      const sectionHeadings = parsedSections
        .map((s, i) => s.title ? { id: `section-${i}`, text: s.title, level: 2 } : null)
        .filter(Boolean);
      return { sanitizedContent: '', headings: sectionHeadings };
    }
    if (!blog?.content) return { sanitizedContent: '', headings: [] };
    const withIds = injectHeadingIds(blog.content);
    return {
      sanitizedContent: sanitizeBlogContent(withIds),
      headings: extractHeadings(withIds),
    };
  }, [blog?.content, parsedSections]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: blog.title, url: window.location.href });
    } else {
      handleCopyLink();
    }
  };

  const scrollToHeading = (id) => {
    if (id.startsWith('section-')) {
      const el = document.querySelector(`[data-section-id="${id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const catColor = CATEGORY_COLORS[blog?.category] || CATEGORY_COLORS['Other'];

  const displayCategories = sidebarCategories.length > 0 ? sidebarCategories : FALLBACK_CATEGORIES;

  if (loading) return <LoadingSpinner fullScreen text="Loading blog post..." />;

  if (error || !blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Blog Post Not Found</Typography>
        <Typography color="text.secondary" paragraph>
          The blog post you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/blog')}>
          Back to Blog
        </Button>
      </Container>
    );
  }

  const blogImage = getBlogImage(blog);
  const breadcrumbItems = [
    { label: 'Blog', path: '/blog' },
    { label: blog.title, path: `/blog/${slug}` },
  ];

  return (
    <Box>
      <SEO
        title={blog.title}
        description={blog.shortDescription || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160)}
        path={`/blog/${slug}`}
        type="article"
        image={blogImage}
        article={{
          publishedTime: blog.publishDate,
          modifiedTime: blog.updatedAt,
          author: blog.authorName,
          tags: blog.tags?.split(',').map(t => t.trim()),
        }}
        structuredData={articleSchema(blog, `/blog/${slug}`)}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 260, sm: 380, md: 480 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: blogImage ? 'grey.900' : catColor.bg,
          background: !blogImage
            ? `linear-gradient(135deg, ${catColor.bg} 0%, ${alpha(catColor.bg, 0.7)} 100%)`
            : undefined,
        }}
      >
        {blogImage && (
          <Box
            component="img"
            src={blogImage}
            alt={blog.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: blogImage
              ? 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72) 100%)'
              : 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)',
          }}
        />
        {/* Bottom-left: category chip + title preview */}
        <Box sx={{ position: 'absolute', bottom: 28, left: { xs: 16, md: 40 }, right: { xs: 16, md: 40 } }}>
          <Chip
            label={blog.category || 'General'}
            sx={{
              bgcolor: blogImage ? alpha(catColor.bg, 0.9) : 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.78rem',
              mb: 1.5,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              lineHeight: 1.25,
              display: { xs: 'none', md: '-webkit-box' },
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {blog.title}
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/blog')}
          sx={{ mb: 2 }}
        >
          Back to Blog
        </Button>

        <Grid container spacing={4}>
          {/* ── Main Content ──────────────────────────────── */}
          <Grid item xs={12} md={8}>

            {/* Category chip (always shown below hero on mobile / above title) */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={blog.category || 'General'}
                sx={{ bgcolor: catColor.bg, color: 'white', fontWeight: 700 }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              component="h1"
              fontWeight={700}
              sx={{ lineHeight: 1.25, mb: 2.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}
            >
              {blog.title}
            </Typography>

            {/* Meta row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15 }}>
                  {(blog.authorName || 'E')[0]}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {blog.authorName || 'Editorial Team'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(blog.publishDate || blog.createdAt)}
                </Typography>
              </Box>
              {blog.readingTimeMinutes && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {blog.readingTimeMinutes} min read
                  </Typography>
                </Box>
              )}
              {blog.viewCount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VisibilityIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {blog.viewCount} views
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Short description */}
            {blog.shortDescription && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 3,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  borderLeft: '4px solid',
                  borderColor: catColor.bg,
                  bgcolor: alpha(catColor.bg, 0.06),
                  pl: 2,
                  py: 1,
                  borderRadius: '0 8px 8px 0',
                }}
              >
                {blog.shortDescription}
              </Typography>
            )}

            <Divider sx={{ mb: 4 }} />

            {/* Blog content */}
            {parsedSections.length > 0 ? (
              <Box>
                {parsedSections.map((section, i) => (
                  <Box key={i} data-section-id={`section-${i}`}>
                    <SectionRenderer section={section} catColor={catColor} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  '& p': { mb: 2, lineHeight: 1.9, fontSize: '1.05rem' },
                  '& h2': {
                    fontSize: '1.55rem', fontWeight: 700,
                    mt: 5, mb: 2, pb: 1,
                    borderBottom: `3px solid ${catColor.bg}`,
                    color: catColor.bg,
                  },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 3.5, mb: 1.5 },
                  '& h4': { fontSize: '1.05rem', fontWeight: 600, mt: 2.5, mb: 1 },
                  '& ul, & ol': { mb: 2, pl: 3 },
                  '& li': { mb: 0.75, lineHeight: 1.8 },
                  '& img': { maxWidth: '100%', borderRadius: 2, my: 2, display: 'block' },
                  '& blockquote': {
                    borderLeft: `4px solid ${catColor.bg}`,
                    pl: 2.5, py: 1, my: 3,
                    bgcolor: alpha(catColor.bg, 0.06),
                    borderRadius: '0 8px 8px 0',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                  },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    my: 3,
                    fontSize: '0.95rem',
                  },
                  '& th': {
                    bgcolor: 'action.selected',
                    fontWeight: 700,
                    p: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'left',
                  },
                  '& td': {
                    p: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                    verticalAlign: 'top',
                  },
                  '& tr:nth-of-type(even)': { bgcolor: 'action.hover' },
                  '& a': { color: 'primary.main', textDecoration: 'underline' },
                  '& code': {
                    bgcolor: 'action.selected',
                    px: 0.75, py: 0.25,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.88em',
                  },
                  '& pre': {
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    p: 2.5,
                    borderRadius: 2,
                    overflowX: 'auto',
                    my: 2.5,
                    '& code': { bgcolor: 'transparent', color: 'inherit' },
                  },
                  '& hr': { border: 'none', borderTop: '2px solid', borderColor: 'divider', my: 4 },
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}

            {/* Tags row */}
            {blog.tags && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Tags:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {blog.tags.split(',').map((tag, i) =>
                    tag.trim() ? (
                      <Chip
                        key={i}
                        label={tag.trim()}
                        size="small"
                        onClick={() => navigate(`/blog?category=${tag.trim()}`)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: alpha(TAG_PALETTE[i % TAG_PALETTE.length], 0.12),
                          color: TAG_PALETTE[i % TAG_PALETTE.length],
                          fontWeight: 600,
                          border: `1px solid ${alpha(TAG_PALETTE[i % TAG_PALETTE.length], 0.3)}`,
                          '&:hover': {
                            bgcolor: alpha(TAG_PALETTE[i % TAG_PALETTE.length], 0.22),
                          },
                        }}
                      />
                    ) : null
                  )}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Author box */}
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 2.5 }}
            >
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: 22, flexShrink: 0 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {blog.authorName || 'Editorial Team'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Published on {formatDate(blog.publishDate || blog.createdAt)}
                  {blog.updatedAt && blog.updatedAt !== blog.createdAt &&
                    ` · Updated ${formatDate(blog.updatedAt)}`}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                  <IconButton onClick={handleCopyLink} size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton onClick={handleShare} size="small">
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>

          {/* ── Sidebar ───────────────────────────────────── */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Table of Contents */}
              {headings.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      px: 2.5, py: 1.75,
                      bgcolor: catColor.bg,
                      display: 'flex', alignItems: 'center', gap: 1,
                    }}
                  >
                    <FormatListBulletedIcon fontSize="small" sx={{ color: 'white' }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>
                      Table of Contents
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    {headings.map((h) => (
                      <ListItem key={h.id} disablePadding>
                        <ListItemButton
                          onClick={() => scrollToHeading(h.id)}
                          sx={{
                            pl: h.level === 3 ? 4 : 2, py: 0.75,
                            borderLeft: h.level === 2 ? `3px solid ${catColor.bg}` : '3px solid transparent',
                            '&:hover': { bgcolor: alpha(catColor.bg, 0.08) },
                          }}
                        >
                          <ListItemText
                            primary={h.text}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: h.level === 2 ? 'text.primary' : 'text.secondary',
                              fontWeight: h.level === 2 ? 600 : 400,
                              noWrap: true,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {/* Share */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Share this Article
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={copied ? <ContentCopyIcon /> : <ShareIcon />}
                  onClick={handleShare}
                  size="small"
                >
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </Button>
              </Paper>

              {/* Recent Posts */}
              {recentBlogs.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 1.75, bgcolor: catColor.bg }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>Recent Posts</Typography>
                  </Box>
                  {recentBlogs.map((rb, i) => (
                    <Box key={rb.id}>
                      <Box
                        sx={{
                          display: 'flex', gap: 1.5, p: 1.5,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          transition: 'background 0.15s',
                        }}
                        onClick={() => navigate(`/blog/${rb.urlSlug || rb.id}`)}
                      >
                        {getBlogImage(rb) ? (
                          <Box
                            component="img"
                            src={getBlogImage(rb)}
                            alt={rb.title}
                            sx={{
                              width: 72, height: 56,
                              objectFit: 'cover',
                              borderRadius: 1,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 72, height: 56,
                              borderRadius: 1,
                              bgcolor: 'action.selected',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Typography variant="caption" color="text.disabled">Blog</Typography>
                          </Box>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4,
                              mb: 0.5,
                            }}
                          >
                            {rb.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(rb.publishDate || rb.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      {i < recentBlogs.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Paper>
              )}

              {/* Categories */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Browse by Category
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {displayCategories.map((cat) => {
                    const cc = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other'];
                    const isActive = blog.category === cat;
                    return (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        onClick={() => navigate(`/blog?category=${cat}`)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isActive ? cc.bg : alpha(cc.bg, 0.1),
                          color: isActive ? 'white' : cc.bg,
                          fontWeight: isActive ? 700 : 500,
                          border: `1px solid ${alpha(cc.bg, 0.3)}`,
                          '&:hover': { bgcolor: isActive ? cc.bg : alpha(cc.bg, 0.2) },
                        }}
                      />
                    );
                  })}
                </Box>
              </Paper>

            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default BlogDetail;
