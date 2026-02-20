'use client';

import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';

const faqs = [
    {
        question: "How does hourly billing work for corporate returns?",
        answer: "We bill strictly for the exact amount of time our CPAs spend working on your file. You'll receive a transparent, fully itemized breakdown so you know exactly what you're paying for without any surprise fixed fees."
    },
    {
        question: "Do you offer bookkeeping or payroll services?",
        answer: "Yes, we offer comprehensive bookkeeping and payroll solutions. By managing your day-to-day financial data, we ensure our strategic tax planning and corporate filing services are built on a rock-solid, accurate foundation."
    },
    {
        question: "What if my business has multiple entities or complex corporate structures?",
        answer: "Our senior advisory team handles complex structural needs including multi-entity corporations, holding companies, and specialized tax roll-overs. We recommend partnering with us directly to discuss your specific organizational needs."
    },
    {
        question: "What documents do I need to prepare my T2 return?",
        answer: "Generally, we need your finalized financial statements (Income Statement and Balance Sheet), trial balances, prior year Notice of Assessment, and access to your accounting software if integrated. Our intake process will guide you through exactly what's needed."
    }
];

export default function FAQBusiness() {
    return (
        <section className="w-full bg-white py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-[#111] text-center mb-10 font-manrope">
                        Frequently Asked Questions
                    </h2>
                    <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                        {faqs.map((faq) => (
                            <Disclosure as="div" key={faq.question} className="pt-6">
                                {({ open }) => (
                                    <>
                                        <dt>
                                            <Disclosure.Button className="flex w-full items-start justify-between text-left text-[#111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2952E3] rounded-md px-2 -mx-2">
                                                <span className="text-base font-semibold leading-7">{faq.question}</span>
                                                <span className="ml-6 flex h-7 items-center">
                                                    {open ? (
                                                        <MinusSmallIcon className="h-6 w-6 text-[#2952E3]" aria-hidden="true" />
                                                    ) : (
                                                        <PlusSmallIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                                    )}
                                                </span>
                                            </Disclosure.Button>
                                        </dt>
                                        <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                            <p className="text-base leading-7 text-gray-600 font-light">{faq.answer}</p>
                                        </Disclosure.Panel>
                                    </>
                                )}
                            </Disclosure>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
