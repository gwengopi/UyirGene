import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../testUtils';
import Courses from '../../pages/Courses';
import * as courseService from '../../services/courseService';

// Mock the course service
vi.mock('../../services/courseService', () => ({
  getAllCourses: vi.fn(),
}));

const mockCourses = [
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'Learn React from scratch',
    instructor: 'John Doe',
    price: 999,
    category: 'Programming',
    imageUrl: '/react.jpg',
  },
  {
    id: 2,
    title: 'Node.js Basics',
    description: 'Backend development with Node',
    instructor: 'Jane Smith',
    price: 0,
    category: 'Programming',
    imageUrl: '/node.jpg',
  },
];

describe('Courses Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    courseService.getAllCourses.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<Courses />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders courses after loading', async () => {
    courseService.getAllCourses.mockResolvedValueOnce(mockCourses);

    renderWithProviders(<Courses />);

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Node.js Basics')).toBeInTheDocument();
    });
  });

  it('shows empty state when no courses', async () => {
    courseService.getAllCourses.mockResolvedValueOnce([]);

    renderWithProviders(<Courses />);

    await waitFor(() => {
      expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    courseService.getAllCourses.mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Courses />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load courses/i)).toBeInTheDocument();
    });
  });

  it('displays page title', async () => {
    courseService.getAllCourses.mockResolvedValueOnce(mockCourses);

    renderWithProviders(<Courses />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /courses/i })).toBeInTheDocument();
    });
  });

  it('has search input', async () => {
    courseService.getAllCourses.mockResolvedValueOnce(mockCourses);

    renderWithProviders(<Courses />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });
});
