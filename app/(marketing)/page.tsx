import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ComparisonTableFull } from "@/components/comparison-table-full";
import FAQ from "@/components/faq";
import { Check } from "lucide-react";

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-clip w-full max-w-[100vw]">
      {/* Hero Section (Edge-to-Edge Blue) */}
      <section className="w-full bg-[#2952E3] pt-12 pb-16 lg:py-24">
        {/* Inner Content Box */}
        <div className="max-w-[1154px] mx-auto px-4 flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-[59px]">
          {/* Left Side (Text) */}
          <div className="w-full xl:w-1/2 flex flex-col space-y-6">
            <h2 className="text-sm font-medium uppercase tracking-wide text-white/90">
              Keep more of what&apos;s yours.
            </h2>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white font-manrope">
              Taxes are complicated. Filing them shouldn&apos;t be.
            </h1>
            <p className="text-lg text-white/90 max-w-lg">
              Upload your documents, answer a few questions, and have your return prepared by our team.
            </p>
            <div className="pt-4">
              <Link href="/get-started">
                <Button size="lg" className="rounded-full px-8 font-semibold bg-white text-[#2952E3] hover:bg-white/90">
                  Start Filing
                </Button>
              </Link>

            </div>
          </div>

          {/* Right Side (Image) */}
          <div className="w-full xl:w-1/2 flex justify-end">
            <div className="relative w-full h-auto bg-transparent">
              <Image
                src="/images/hero-collage.png"
                alt="VSF Capital Structuring Hero"
                width={800}
                height={800}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-[1154px] mx-auto px-4 flex flex-col xl:flex-row xl:justify-between gap-12 xl:gap-24">
          {/* Left Side (Title) */}
          <div className="w-full xl:w-[40%]">
            <h2 className="text-4xl font-bold font-manrope text-[#111] leading-tight">
              Helping you keep more of what&apos;s yours
            </h2>
          </div>

          {/* Right Side (Features List) */}
          <div className="w-full xl:w-[50%] flex flex-col gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">Maximum Refund Guarantee</h3>
              <p className="text-muted-foreground">We apply all eligible credits and deductions to ensure you keep more of what&apos;s yours.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Secure Document Handling</h3>
              <p className="text-muted-foreground">Encrypted uploads, private storage, and strict confidentiality protocols.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Transparent Pricing</h3>
              <p className="text-muted-foreground">Upfront, predictable pricing based on your situation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stress-Free Filing Section */}
      <section className="mt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1154px] mx-auto rounded-[24px] overflow-hidden flex flex-col xl:flex-row xl:h-[500px]">
          {/* Left Side (Image) */}
          <div className="w-full xl:w-1/2 relative h-[400px] xl:h-full">
            <Image
              src="/images/coffee-girl.jpg"
              alt="Stress-Free Filing"
              fill
              className="object-cover object-top"
            />
          </div>

          {/* Right Side (Content) */}
          <div className="w-full xl:w-1/2 bg-[#2952E3] p-8 lg:p-12 xl:p-20 flex flex-col justify-center">
            <h2 className="text-4xl xl:text-5xl font-bold font-manrope text-white leading-tight">
              File your taxes, without the stress.
            </h2>
            <p className="text-white/90 mt-6 text-lg xl:text-xl">
              Upload your documents, answer a few questions, and our licensed team handles the rest.
            </p>
            <p className="text-white/90 mt-2 text-lg xl:text-xl">
              Accurately, securely, and on your schedule.
            </p>
            <div className="mt-8">
              <Link href="/get-started">
                <Button className="rounded-full px-8 py-6 text-lg font-semibold bg-white text-[#2952E3] hover:bg-white/90 w-fit">
                  Start Filing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* Pricing Section */}
      <section className="bg-gray-50 pt-20 pb-0 relative z-50">
        <div className="max-w-[1154px] mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#111] mb-12 font-manrope">
            Pick the plan that&apos;s right for you
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Essential Card */}
            <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between shadow-sm h-full border border-gray-100">
              <div className="flex-grow">
                <div className="h-5 mb-2" aria-hidden="true" />
                <h3 className="text-3xl font-bold text-[#111] mb-4 font-manrope">Essential</h3>
                <p className="text-muted-foreground mb-6 min-h-[48px]">
                  For students and individuals with straightforward personal tax situations.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">One or two T4 slips</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Tuition credits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Basic non-refundable credits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">CRA e-file and review</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-auto">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Estimated</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-[#111] tracking-tight">$150</span>
                  <span className="text-sm text-gray-500 font-medium ml-2">including tax</span>
                </div>
              </div>
            </div>

            {/* Plus Card */}
            <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between shadow-sm relative h-full border-2 border-blue-50">
              <div className="flex-grow">
                <span className="text-sm font-medium text-blue-600 mb-2 block uppercase tracking-wide">Most Popular</span>
                <h3 className="text-3xl font-bold text-[#111] mb-4 font-manrope">Plus</h3>
                <p className="text-muted-foreground mb-6 min-h-[48px]">
                  For individuals with employment income and basic investment activity.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Employment income (multiple T4s)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111] tracking-tight">RRSPs, donations, medical expenses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Tuition and transfers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Basic investment slips (T3/T5)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">CRA e-file and review</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-auto">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Estimated</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-[#111] tracking-tight">$250</span>
                  <span className="text-sm text-gray-500 font-medium ml-2">including tax</span>
                </div>
              </div>
            </div>

            {/* Pro Card */}
            <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between shadow-sm h-full border border-gray-100">
              <div className="flex-grow">
                <div className="h-5 mb-2" />
                <h3 className="text-3xl font-bold text-[#111] mb-4 font-manrope">Pro</h3>
                <p className="text-muted-foreground mb-6 min-h-[48px]">
                  For individuals with investments, rental properties, or multi-source income.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Capital gains/losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111] tracking-tight">Rental property income and expenses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Foreign income and credits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">Optimization and carry forward review</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="text-[#111]">CRA-ready documentation package</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-auto">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Estimated</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-[#111] tracking-tight">$350</span>
                  <span className="text-sm text-gray-500 font-medium ml-2">including tax</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50">
        <ComparisonTableFull />
      </div>

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA Section */}
      {/* Final CTA Section */}
      {/* Final CTA Section - Full Width Blue */}
      {/* Final CTA - High Impact Minimalist */}
      <section className='w-full bg-gray-50 py-16 lg:py-32 border-t border-gray-100'>
        <div className='max-w-4xl mx-auto px-4 text-center'>

          <h2 className='text-4xl lg:text-5xl leading-tight font-bold font-manrope text-gray-900 mb-8 tracking-tight'>
            Keep More of What&apos;s Yours.
          </h2>

          <p className='text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light'>
            Join the forward-thinking Canadians choosing VSF for a more strategic approach to their taxes.
          </p>

          <div className='flex justify-center'>
            <Link
              href='/get-started'
              className='inline-flex items-center justify-center px-12 py-4 text-xl font-semibold text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700 hover:-translate-y-1'
            >
              Start Filing
            </Link>
          </div>
          {/* Optional Trust Indicator below button */}
          <p className='mt-8 text-sm text-gray-400 font-medium uppercase tracking-widest'>
            Secure • Private • Professional
          </p>
        </div>
      </section>
    </div >
  );
}
