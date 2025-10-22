//Hero.test.tsx
// ✅ mock first so it’s active before importing Hero
jest.mock('@mui/material', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Hero } from './Hero';


describe('Hero Component', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    jest.clearAllMocks();
  });


  describe('Rendering', () => {
    it('should render the hero section with correct heading', () => {
      render(<Hero />);
      expect(
        screen.getByRole('heading', { name: /ai-powered stock predictions/i })
      ).toBeInTheDocument();
    });


    it('should render the description paragraph', () => {
      render(<Hero />);
      expect(
        screen.getByText(/make smarter investment decisions/i)
      ).toBeInTheDocument();
    });


    it('should render the Get Started button', () => {
      render(<Hero />);
      expect(
        screen.getByRole('button', { name: /get started/i })
      ).toBeInTheDocument();
    });


    it('should render the stock market image with correct alt text', () => {
      render(<Hero />);
      expect(
        screen.getByAltText(/stock market chart illustration/i)
      ).toBeInTheDocument();
    });
  });


  describe('Accessibility', () => {
    it('should have semantic section wrapper', () => {
      render(<Hero />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });


    it('should have aria-labelledby attribute pointing to heading', () => {
      render(<Hero />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'hero-heading');
    });


    it('should have focusable CTA button', () => {
      render(<Hero />);
      const button = screen.getByRole('button', { name: /get started/i });
      expect(button).toBeInTheDocument();
      button.focus();
      expect(button).toHaveFocus();
    });
  });


  describe('Navigation Event', () => {
    it('should dispatch navigate event with signup page on button click', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      render(<Hero />);


      const button = screen.getByRole('button', { name: /get started/i });
      fireEvent.click(button);


      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigate',
          detail: { page: 'signup' },
        })
      );
    });
  });


  describe('Image Fallback', () => {
    it('should use fallback image when main image fails to load', async () => {
      render(<Hero />);
      const image = screen.getByAltText(/stock market chart illustration/i);


      // Simulate image load error
      fireEvent.error(image);


      await waitFor(() => {
        expect(image).toHaveAttribute(
          'src',
          'https://placehold.co/1080x720?text=Stock+Prediction+AI'
        );
      });
    });


    it('should have lazy loading attribute', () => {
      render(<Hero />);
      const image = screen.getByAltText(/stock market chart illustration/i);
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });


  describe('Styling and Layout', () => {
    it('should have gradient background classes', () => {
      render(<Hero />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass(
        'bg-gradient-to-br',
        'from-slate-50',
        'to-teal-50'
      );
    });


    it('should have responsive flex layout classes', () => {
      render(<Hero />);
      const container = screen.getByRole('region').querySelector('.flex');
      expect(container).toHaveClass('flex-col', 'lg:flex-row');
    });
  });


  describe('Material UI Integration', () => {
    it('should render Material UI Button with correct props', () => {
      render(<Hero />);
      const button = screen.getByRole('button', { name: /get started/i });
      expect(button).toBeInTheDocument();
    });
  });
});
