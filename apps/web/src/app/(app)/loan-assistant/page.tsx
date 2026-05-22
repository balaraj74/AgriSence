
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  checkLoanInsuranceEligibility,
  type CheckLoanInsuranceEligibilityInput,
  type CheckLoanInsuranceEligibilityOutput,
} from '@/ai/flows/loan-insurance-assistant-flow';
import { Loader2, Landmark, Bot, ShieldCheck, Banknote, ListChecks, FileText, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the schema directly in the client component
const formSchema = z.object({
  landSizeAcres: z.coerce.number().min(0, "Land size must be a positive number."),
  primaryCrop: z.string().min(1, "Primary crop is required."),
  location: z.string().min(1, "Location is required."),
  hasKisanCreditCard: z.boolean(),
});


const ResultCard = ({ scheme }: { scheme: CheckLoanInsuranceEligibilityOutput['eligibleSchemes'][0] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                {scheme.schemeType === 'Loan' ? <Banknote className="h-6 w-6 text-primary" /> : <ShieldCheck className="h-6 w-6 text-primary" />}
                <span>{scheme.schemeName}</span>
            </CardTitle>
            <CardDescription>{scheme.eligibilitySummary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div>
                <Label className="flex items-center gap-2 font-semibold mb-1"><UserCheck className="h-4 w-4" /> Key Benefits</Label>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {scheme.benefits.split('*').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                </ul>
            </div>
             <div>
                <Label className="flex items-center gap-2 font-semibold mb-1"><ListChecks className="h-4 w-4" /> Next Steps to Apply</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{scheme.nextSteps}</p>
            </div>
             <div>
                <Label className="flex items-center gap-2 font-semibold mb-1"><FileText className="h-4 w-4" /> Required Documents</Label>
                <p className="text-sm text-muted-foreground">{scheme.requiredDocuments}</p>
            </div>
        </CardContent>
    </Card>
);


export default function LoanAssistantPage() {
  const [result, setResult] = useState<CheckLoanInsuranceEligibilityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CheckLoanInsuranceEligibilityInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      landSizeAcres: 5,
      primaryCrop: '',
      location: '',
      hasKisanCreditCard: false,
    },
  });

  const onSubmit = async (data: CheckLoanInsuranceEligibilityInput) => {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await checkLoanInsuranceEligibility(data);
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI could not generate a report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Landmark className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Loan & Insurance Assistant</h1>
          <p className="text-muted-foreground">Check your eligibility for key financial schemes.</p>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Enter Your Details</CardTitle>
              <CardDescription>
                Provide some basic information to help the AI find the right schemes for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="landSizeAcres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Land Size (in acres)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryCrop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Crop</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Sugarcane' or 'Paddy'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (District, State)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Belgaum, Karnataka'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="hasKisanCreditCard"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                    <div className="space-y-0.5">
                        <FormLabel>Do you already have a Kisan Credit Card (KCC)?</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Analyzing...' : 'Check Eligibility'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
           <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Analysis Complete</AlertTitle>
                <AlertDescription>{result.overallSummary}</AlertDescription>
            </Alert>
            <div className="grid lg:grid-cols-2 gap-6">
                {result.eligibleSchemes.length > 0 ? (
                    result.eligibleSchemes.map((scheme, index) => (
                        <ResultCard key={index} scheme={scheme} />
                    ))
                ) : (
                    <div className="lg:col-span-2 text-center py-12 bg-card rounded-lg border">
                        <p className="text-muted-foreground font-semibold">
                        No specific schemes found based on the provided details.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your inputs or check the general Government Schemes page.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
