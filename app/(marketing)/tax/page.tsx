import { Button } from "@/components/ui/button";

export default function TaxPage() {
    return (
        <div className="min-h-screen py-20 bg-background">
            <div className="container px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-6">Tax Services</h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    Professional tax filing and structuring services for individuals and businesses.
                </p>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="text-xl font-bold mb-2">Personal</h3>
                        <p className="text-muted-foreground mb-4">For individuals with employment income.</p>
                        <Button className="w-full">Get Started</Button>
                    </div>
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="text-xl font-bold mb-2">Plus</h3>
                        <p className="text-muted-foreground mb-4">For individuals with investments or rental properties.</p>
                        <Button className="w-full">Get Started</Button>
                    </div>
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="text-xl font-bold mb-2">Pro</h3>
                        <p className="text-muted-foreground mb-4">For complex situations and multi-source income.</p>
                        <Button className="w-full">Get Started</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
