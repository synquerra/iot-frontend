/**
 * Layout Components Tests
 * Tests for the colorful UI redesign layout components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  SectionDivider,
  GradientHeader,
  ContentSection,
  PageContainer,
  HierarchySection
} from './LayoutComponents';

describe('Layout Components', () => {
  describe('SectionDivider', () => {
    it('renders gradient divider by default', () => {
      const { container } = render(<SectionDivider />);
      expect(container.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
    });

    it('renders rainbow variant', () => {
      const { container } = render(<SectionDivider variant="rainbow" />);
      expect(container.querySelector('.from-violet-500')).toBeInTheDocument();
    });

    it('renders dotted variant', () => {
      const { container } = render(<SectionDivider variant="dotted" />);
      expect(container.querySelectorAll('.rounded-full')).toHaveLength(5);
    });

    it('applies custom color scheme', () => {
      const { container } = render(<SectionDivider colorScheme="blue" />);
      expect(container.querySelector('.via-blue-500\\/50')).toBeInTheDocument();
    });
  });

  describe('GradientHeader', () => {
    it('renders title and subtitle', () => {
      render(
        <GradientHeader 
          title="Test Title" 
          subtitle="Test Subtitle" 
        />
      );
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('applies gradient variant styling', () => {
      const { container } = render(
        <GradientHeader 
          title="Test" 
          variant="gradient" 
          colorScheme="blue"
        />
      );
      
      expect(container.querySelector('.from-blue-600\\/20')).toBeInTheDocument();
    });

    it('renders hero variant with larger styling', () => {
      const { container } = render(
        <GradientHeader 
          title="Hero Title" 
          variant="hero" 
          size="xl"
        />
      );
      
      expect(container.querySelector('.min-h-\\[300px\\]')).toBeInTheDocument();
      expect(screen.getByText('Hero Title')).toBeInTheDocument();
    });

    it('centers content when specified', () => {
      const { container } = render(
        <GradientHeader 
          title="Centered" 
          centered={true}
        />
      );
      
      expect(container.querySelector('.text-center')).toBeInTheDocument();
    });
  });

  describe('ContentSection', () => {
    it('renders children content', () => {
      render(
        <ContentSection>
          <div>Test Content</div>
        </ContentSection>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies subtle variant styling', () => {
      const { container } = render(
        <ContentSection variant="subtle" colorScheme="teal">
          <div>Content</div>
        </ContentSection>
      );
      
      expect(container.querySelector('.from-teal-900\\/5')).toBeInTheDocument();
    });

    it('applies accent variant styling', () => {
      const { container } = render(
        <ContentSection variant="accent" colorScheme="purple">
          <div>Content</div>
        </ContentSection>
      );
      
      expect(container.querySelector('.from-purple-500\\/5')).toBeInTheDocument();
    });

    it('applies highlighted variant with border', () => {
      const { container } = render(
        <ContentSection variant="highlighted" colorScheme="green" bordered={true}>
          <div>Content</div>
        </ContentSection>
      );
      
      expect(container.querySelector('.border-green-500\\/20')).toBeInTheDocument();
    });

    it('applies elevation when specified', () => {
      const { container } = render(
        <ContentSection elevated={true}>
          <div>Content</div>
        </ContentSection>
      );
      
      expect(container.querySelector('.shadow-lg')).toBeInTheDocument();
    });
  });

  describe('PageContainer', () => {
    it('renders children and title', () => {
      render(
        <PageContainer title="Page Title">
          <div>Page Content</div>
        </PageContainer>
      );
      
      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('applies gradient background variant', () => {
      const { container } = render(
        <PageContainer backgroundVariant="gradient">
          <div>Content</div>
        </PageContainer>
      );
      
      expect(container.querySelector('.from-violet-900\\/5')).toBeInTheDocument();
    });

    it('applies max width constraints', () => {
      const { container } = render(
        <PageContainer maxWidth="4xl">
          <div>Content</div>
        </PageContainer>
      );
      
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });
  });

  describe('HierarchySection', () => {
    it('renders children with level 1 styling', () => {
      const { container } = render(
        <HierarchySection level={1} colorScheme="violet">
          <div>Hierarchy Content</div>
        </HierarchySection>
      );
      
      expect(screen.getByText('Hierarchy Content')).toBeInTheDocument();
      expect(container.querySelector('.border-violet-500\\/20')).toBeInTheDocument();
      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });

    it('renders children with level 2 styling', () => {
      const { container } = render(
        <HierarchySection level={2} colorScheme="blue">
          <div>Level 2 Content</div>
        </HierarchySection>
      );
      
      expect(container.querySelector('.border-blue-500\\/10')).toBeInTheDocument();
      expect(container.querySelector('.p-4')).toBeInTheDocument();
    });

    it('renders children with level 3 styling', () => {
      const { container } = render(
        <HierarchySection level={3} colorScheme="green">
          <div>Level 3 Content</div>
        </HierarchySection>
      );
      
      expect(container.querySelector('.border-green-500\\/5')).toBeInTheDocument();
      expect(container.querySelector('.p-3')).toBeInTheDocument();
    });

    it('applies custom spacing', () => {
      const { container } = render(
        <HierarchySection spacing="lg">
          <div>Spaced Content</div>
        </HierarchySection>
      );
      
      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('works together in complex layouts', () => {
      render(
        <PageContainer title="Integration Test" backgroundVariant="gradient">
          <ContentSection variant="accent" colorScheme="teal">
            <GradientHeader title="Section Header" variant="gradient" />
            <SectionDivider variant="rainbow" />
            <HierarchySection level={1} colorScheme="purple">
              <div>Nested Content</div>
            </HierarchySection>
          </ContentSection>
        </PageContainer>
      );
      
      expect(screen.getByText('Integration Test')).toBeInTheDocument();
      expect(screen.getByText('Section Header')).toBeInTheDocument();
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <GradientHeader title="Main Title" subtitle="Subtitle" />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Main Title');
    });

    it('provides semantic section structure', () => {
      const { container } = render(
        <ContentSection>
          <div>Section Content</div>
        </ContentSection>
      );
      
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });
});