/**
 * Sidebar navigation component for dashboard pages.
 * Uses Material UI's Drawer for responsive, accessible navigation.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the sidebar drawer is open (for mobile)
 * @param {() => void} props.onClose - Callback to close the drawer (for mobile)
 * @param {string} props.activePage - The current active page identifier
 * @returns {JSX.Element} Rendered sidebar navigation component
 *
 * @example
 * <Sidebar open={open} onClose={handleClose} activePage="dashboard" />
 */