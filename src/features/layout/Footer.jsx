export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} onedayteam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
