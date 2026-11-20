import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  PrimaryNavigation,
  PUBLIC_NAVIGATION_ITEMS,
  partitionNavigationItems,
  NavigationGroup,
  NavigationItem,
} from '../features/navigation';

afterEach(() => {
  cleanup();
});

describe('Enterprise Responsive Smart Navigation: DOM & Accessibility Interactions', () => {
  it('opens dropdown menus on click, exposes ARIA attributes, and closes cleanly on Escape', () => {
    const onNavigate = vi.fn();

    function Wrapper() {
      const [activeId, setActiveId] = React.useState<string | null>(null);
      const part = partitionNavigationItems(PUBLIC_NAVIGATION_ITEMS, 1024);
      return (
        <PrimaryNavigation
          visibleItems={part.visibleItems}
          overflowItems={part.overflowItems}
          showOverflowDropdown={true}
          currentView="home"
          pathname="/"
          activeDropdownId={activeId}
          setActiveDropdownId={setActiveId}
          onNavigate={onNavigate}
        />
      );
    }

    const { getByRole, queryByRole, getByText } = render(<Wrapper />);

    // Home is active
    const homeBtn = getByRole('button', { name: 'Home' });
    expect(homeBtn.getAttribute('aria-current')).toBe('page');

    // Open About dropdown
    const aboutBtn = getByRole('button', { name: 'About' });
    expect(aboutBtn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(aboutBtn);
    expect(aboutBtn.getAttribute('aria-expanded')).toBe('true');
    expect(getByRole('menu', { name: 'about navigation menu' })).toBeTruthy();

    // Press Escape -> closes dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(queryByRole('menu', { name: 'about navigation menu' })).toBeNull();

    // At 1024px, More overflow button is visible and exposes Get Involved / Resources / Contact
    const moreBtn = getByRole('button', { name: 'More' });
    fireEvent.click(moreBtn);
    expect(getByRole('menu', { name: 'More navigation destinations' })).toBeTruthy();

    // Clicking Volunteer inside More triggers navigation and closes dropdown
    fireEvent.click(getByText('Volunteer'));
    expect(onNavigate).toHaveBeenCalledWith('volunteer', undefined);
    expect(queryByRole('menu', { name: 'More navigation destinations' })).toBeNull();
  });

  it('supports collapsible accordion NavigationGroup with ARIA expanded state and keyboard-accessible NavigationItem', () => {
    const onSelect = vi.fn();

    function AccordionWrapper() {
      const [open, setOpen] = React.useState(false);
      return (
        <NavigationGroup
          id="test-group"
          title="Get Involved"
          badgeCount={2}
          collapsible
          isOpen={open}
          onToggle={() => setOpen((p) => !p)}
        >
          <NavigationItem
            label="Volunteer"
            description="Join community drives"
            iconName="HandHeart"
            variant="drawer"
            role="button"
            onClick={onSelect}
          />
        </NavigationGroup>
      );
    }

    const { getByRole, queryByText } = render(<AccordionWrapper />);
    const trigger = getByRole('button', { name: /Get Involved/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(queryByText('Volunteer')).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const itemBtn = getByRole('button', { name: /Volunteer/i });
    fireEvent.click(itemBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
