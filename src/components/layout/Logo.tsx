/**
 * Logo component for the STALK.AI application.
 *
 * This component displays the company logo as an image, with support for size and style variant props.
 * It is designed to be reusable across various parts of the app (e.g., footer, header).
 *
 * ## Props
 * @param {("sm" | "md" | "lg")} [size="md"] - Optional. Controls the logo's height via Tailwind classes:
 *   - `"sm"` → small (`h-8`)
 *   - `"md"` → medium (`h-12`) *(default)*
 *   - `"lg"` → large (`h-16`)
 *
 * @param {("light" | "dark")} [variant="light"] - Optional. Used to describe visual context where the logo is used.
 *   - `"light"` → for use on dark backgrounds *(default)*
 *   - `"dark"` → for use on light backgrounds
 *
 * ## Notes
 * - The logo image must be available at `/public/logo.png`.
 * - The component applies `data-testid`, `data-size`, and `data-variant` for testability.
 * - This component does not change appearance based on `variant`; it's meant for test queries and future styling.
 *
 * ## Example Usage
 * <Logo size="lg" variant="dark" />
 * <Logo customSize="50px" />
 * <Logo customSize="3rem" />
 * <Logo customSize="10vh" />
 */


// Define optional props to support size and style variants if needed

interface LogoProps {
    size?: "sm" | "md" | "lg";
    customSize?: string; // Accept CSS size string: e.g. "50px", "3rem", "10vw"
    variant?: "light" | "dark";
}


const Logo = ({ size = "md", customSize, variant = "light" }: LogoProps) => {
    // Tailwind height classes based on size
    const sizeClasses = {
        sm: "h-8",
        md: "h-12",
        lg: "h-16",
    };
    

    // If customSize prop is provided, this will override class-based sizing
    const customStyle = customSize ? { height: customSize } : undefined;

    return (
        <img
            src="/logo.png" // Path to the company logo image in /public folder
            alt="STALK.AI logo"
            className={sizeClasses[size]} // Applies height based on size
            style={customStyle} // Apply custom size if provided
            data-testid="mock-logo" // Helps tests identify it
            data-variant={variant}
            data-size={size}
        />
    );
};

export default Logo;