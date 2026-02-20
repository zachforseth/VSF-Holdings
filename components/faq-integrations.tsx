'use client';

import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';

const faqs = [
    {
        question: "How does VSF integrate with my accounting and payroll provider?",
        answer: "We seamlessly connect to the platforms you already use, like QuickBooks, Xero, and Stripe. You don't need to change how you run your business—we simply plug into your existing systems to keep your bookkeeping, reporting, and tax filing perfectly aligned."
    },
    {
        question: "Are integrations available to businesses of all sizes?",
        answer: "We consider businesses of all sizes and assess each one individually based on the systems you use and how we can best set up data sharing between platforms. Regardless if you're a startup or an established enterprise."
    },
    {
        question: "How long does it take to set up an integration?",
        answer: "Most major platform integrations (like QuickBooks and Stripe) are authenticated and fully active in a matter of minutes. More complex, custom ERP syncs can usually be established and tested within a few days."
    },
    {
        question: "Are there fees associated with integrating?",
        answer: "No — integrating your existing platforms comes at absolutely no extra charge. As long as we support your current HRIS, payroll, or bookkeeping stack, we’re happy to make the connection so we can serve you better!"
    }
];

export default function FAQIntegrations() {
    return (
        <section className="w-full bg-white py-24 lg:py-32">
            <div className="max-w-[800px] mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-bold font-manrope text-[#111] mb-12 border-b border-gray-200 pb-8">
                    FAQs
                </h2>

                <dl className="space-y-6 divide-y divide-gray-100">
                    {faqs.map((faq) => (
                        <Disclosure as="div" key={faq.question} className="pt-6">
                            {({ open }) => (
                                <>
                                    <dt>
                                        <Disclosure.Button className="flex w-full items-start justify-between text-left text-[#111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2952E3] rounded-md px-2 -mx-2">
                                            <span className="text-lg font-bold font-manrope">{faq.question}</span>
                                            <span className="ml-6 flex h-7 items-center">
                                                {open ? (
                                                    <MinusSmallIcon className="h-6 w-6 text-[#2952E3]" aria-hidden="true" />
                                                ) : (
                                                    <PlusSmallIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                                )}
                                            </span>
                                        </Disclosure.Button>
                                    </dt>
                                    <Disclosure.Panel as="dd" className="mt-4 px-2 pr-12 pb-6">
                                        <p className="text-base leading-relaxed text-gray-600 font-light">{faq.answer}</p>
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    ))}
                </dl>
            </div>
        </section>
    );
}
