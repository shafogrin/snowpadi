const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} SnowPadi. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a 
              href="#" 
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
            <a 
              href="#" 
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
