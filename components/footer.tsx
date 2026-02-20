import Link from "next/link";
import { Linkedin, Youtube, Instagram, Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#0F172A] text-white pt-24 pb-12">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

                    {/* Left Side: Brand Identity */}
                    <div className="flex flex-col items-start lg:max-w-xs">
                        {/* Logo */}
                        <div className="mb-6">
                            <Link href="/">
                                <svg xmlns="http://www.w3.org/2000/svg" width="246" height="36" viewBox="0 0 246 36" fill="none" className="h-8 w-auto flex-shrink-0">
                                    <g clipPath="url(#clip0_footer)">
                                        <path d="M10.4681 0H0V36H10.4681V0Z" fill="#2952E3" />
                                        <path d="M23.1868 0H12.7188V36H23.1868V0Z" fill="#7297DF" />
                                        <path d="M35.9056 0H25.4375V36H35.9056V0Z" fill="#A0B9EA" />
                                        <path d="M44.4789 25.7668L39.6099 11.2833H42.6808L45.2264 19.6695C45.5093 20.6216 45.8527 21.9788 45.8527 21.9788H45.8931C45.8931 21.9788 46.2366 20.6013 46.5194 19.6695L49.0449 11.2833H52.0148L47.1457 25.7668H44.4789ZM58.5685 26.0909C54.6493 26.0909 52.4269 24.3488 52.3259 21.2901H55.1946C55.3967 23.0321 56.387 23.7209 58.4476 23.7209C59.9424 23.7209 61.2557 23.1942 61.2557 21.8572C61.2557 20.4393 59.8817 20.1557 57.6798 19.6493C55.0936 19.0618 52.7299 18.3731 52.7299 15.3549C52.7299 12.4987 55.0533 11.02 58.2655 11.02C61.5184 11.02 63.6194 12.6203 63.8418 15.5372H61.0337C60.872 14.0787 59.7404 13.3495 58.2456 13.3495C56.6696 13.3495 55.639 14.018 55.639 15.051C55.639 16.2259 56.6492 16.5703 58.791 17.0362C61.7607 17.6844 64.1852 18.3934 64.1852 21.5129C64.1852 24.4501 61.8215 26.0909 58.5685 26.0909ZM65.9349 25.7668V11.2833H76.2789V13.7749H68.8644V17.259H75.1479V19.7708H68.8644V25.7668H65.9349ZM87.6478 26.0706C83.5872 26.0706 80.698 22.9308 80.698 18.5757C80.698 14.2813 83.3648 10.9997 87.6279 10.9997C91.1834 10.9997 93.2849 13.1267 93.5879 15.8816H90.6783C90.4156 14.4231 89.3248 13.471 87.6279 13.471C84.9606 13.471 83.6882 15.6993 83.6882 18.5757C83.6882 21.5331 85.2234 23.6601 87.6478 23.6601C89.3651 23.6601 90.5773 22.627 90.7594 21.1078H93.6282C93.5471 22.3839 93.0017 23.6196 92.0318 24.5311C91.0421 25.4629 89.6482 26.0706 87.6478 26.0706ZM101.438 25.7668C101.277 25.5642 101.176 25.078 101.116 24.6121H101.075C100.55 25.4021 99.8023 26.0098 98.0243 26.0098C95.9029 26.0098 94.4076 24.8957 94.4076 22.8296C94.4076 20.5406 96.2667 19.8113 98.5697 19.4872C100.287 19.2442 101.075 19.1024 101.075 18.3124C101.075 17.5629 100.489 17.0767 99.3375 17.0767C98.0442 17.0767 97.4182 17.5426 97.3371 18.5352H94.8928C94.9734 16.7121 96.3269 15.1118 99.3574 15.1118C102.469 15.1118 103.722 16.5095 103.722 18.9403V24.2273C103.722 25.0173 103.843 25.4832 104.085 25.6655V25.7668H101.438ZM98.6911 24.0855C100.267 24.0855 101.135 23.1132 101.135 22.1003V20.5406C100.651 20.8242 99.9033 20.9862 99.2161 21.1483C97.7819 21.4724 97.0748 21.7965 97.0748 22.7688C97.0748 23.7411 97.7212 24.0855 98.6911 24.0855ZM105.468 29.1699V15.3751H108.115V16.6716H108.176C108.843 15.76 109.812 15.0916 111.226 15.0916C113.974 15.0916 115.732 17.34 115.732 20.5811C115.732 23.9437 113.913 26.0706 111.247 26.0706C109.792 26.0706 108.843 25.4832 108.256 24.5919H108.216V29.1699H105.468ZM110.661 23.7816C112.055 23.7816 112.943 22.627 112.943 20.6621C112.943 18.6972 112.257 17.3198 110.56 17.3198C108.843 17.3198 108.155 18.7985 108.155 20.6621C108.155 22.546 109.024 23.7816 110.661 23.7816ZM117.01 25.7668V15.3751H119.758V25.7668H117.01ZM117.01 13.7546V11.2833H119.758V13.7546H117.01ZM120.922 17.1982V15.3751H122.357V12.1341H125.044V15.3751H126.822V17.1982H125.044V22.708C125.044 23.4778 125.468 23.7411 126.074 23.7411C126.418 23.7411 126.882 23.7209 126.882 23.7209V25.7465C126.882 25.7465 126.256 25.787 125.165 25.787C123.832 25.787 122.357 25.2603 122.357 23.2955V17.1982H120.922ZM134.861 25.7668C134.699 25.5642 134.598 25.078 134.538 24.6121H134.497C133.972 25.4021 133.225 26.0098 131.447 26.0098C129.325 26.0098 127.83 24.8957 127.83 22.8296C127.83 20.5406 129.689 19.8113 131.992 19.4872C133.709 19.2442 134.497 19.1024 134.497 18.3124C134.497 17.5629 133.911 17.0767 132.76 17.0767C131.467 17.0767 130.841 17.5426 130.76 18.5352H128.315C128.396 16.7121 129.749 15.1118 132.78 15.1118C135.892 15.1118 137.144 16.5095 137.144 18.9403V24.2273C137.144 25.0173 137.265 25.4832 137.508 25.6655V25.7668H134.861ZM132.114 24.0855C133.689 24.0855 134.558 23.1132 134.558 22.1003V20.5406C134.073 20.8242 133.326 20.9862 132.639 21.1483C131.204 21.4724 130.497 21.7965 130.497 22.7688C130.497 23.7411 131.144 24.0855 132.114 24.0855ZM138.931 25.7668V11.2833H141.679V25.7668H138.931ZM152.7 26.0909C148.78 26.0909 146.558 24.3488 146.457 21.2901H149.326C149.528 23.0321 150.518 23.7209 152.579 23.7209C154.074 23.7209 155.387 23.1942 155.387 21.8572C155.387 20.4393 154.013 20.1557 151.811 19.6493C149.225 19.0618 146.861 18.3731 146.861 15.3549C146.861 12.4987 149.184 11.02 152.397 11.02C155.65 11.02 157.751 12.6203 157.973 15.3372H155.165C155.003 14.0787 153.872 13.3495 152.377 13.3495C150.801 13.3495 149.771 14.018 149.771 15.051C149.771 16.2259 150.781 16.5703 152.922 17.0362C155.892 17.6844 158.317 18.3934 158.317 21.5129C158.317 24.4501 155.953 26.0909 152.7 26.0909ZM159.139 17.1982V15.3751H160.574V12.1341H163.261V15.3751H165.038V17.1982H163.261V22.708C163.261 23.4778 163.685 23.7411 164.291 23.7411C164.634 23.7411 165.099 23.7209 165.099 23.7209V25.7465C165.099 25.7465 164.473 25.787 163.382 25.787C162.049 25.787 160.574 25.2603 160.574 23.2955V17.1982H159.139ZM169.1 15.3751V17.0362H169.161C169.787 15.8613 170.494 15.2536 171.707 15.2536C172.01 15.2536 172.191 15.2739 172.353 15.3346V17.7452H172.292C170.494 17.5629 169.201 18.5149 169.201 20.7026V25.7668H166.454V15.3751H169.1ZM182.729 25.7668H180.083V24.5514H180.022C179.315 25.5034 178.507 26.0504 177.052 26.0504C174.749 26.0504 173.456 24.5716 173.456 22.3029V15.3751H176.183V21.837C176.183 23.0524 176.729 23.7209 177.9 23.7209C179.193 23.7209 179.982 22.7485 179.982 21.3711V15.3751H182.729V25.7668ZM189.315 26.0706C186.042 26.0706 184.001 23.6803 184.001 20.5811C184.001 17.4818 186.022 15.0916 189.173 15.0916C191.86 15.0916 193.517 16.6513 193.881 18.8998H191.193C191.012 17.9882 190.305 17.2995 189.294 17.2995C187.638 17.2995 186.789 18.5757 186.789 20.5811C186.789 22.546 187.577 23.8626 189.254 23.8626C190.365 23.8626 191.153 23.2752 191.335 22.1003H193.982C193.8 24.3083 192.083 26.0706 189.315 26.0706ZM194.574 17.1982V15.3751H196.009V12.1341H198.695V15.3751H200.473V17.1982H198.695V22.708C198.695 23.4778 199.12 23.7411 199.726 23.7411C200.069 23.7411 200.534 23.7209 200.534 23.7209V25.7465C200.534 25.7465 199.908 25.787 198.817 25.787C197.483 25.787 196.009 25.2603 196.009 23.2955V17.1982H194.574ZM211.081 25.7668H208.434V24.5514H208.374C207.666 25.5034 206.858 26.0504 205.404 26.0504C203.1 26.0504 201.807 24.5716 201.807 22.3029V15.3751H204.535V21.837C204.535 23.0524 205.08 23.7209 206.252 23.7209C207.545 23.7209 208.333 22.7485 208.333 21.3711V15.3751H211.081V25.7668ZM215.505 15.3751V17.0362H215.565C216.192 15.8613 216.899 15.2536 218.111 15.2536C218.414 15.2536 218.596 15.2739 218.757 15.3346V17.7452H218.697C216.899 17.5629 215.606 18.5149 215.606 20.7026V25.7668H212.858V15.3751H215.505ZM219.941 25.7668V15.3751H222.689V25.7668H219.941ZM219.941 13.7546V11.2833H222.689V13.7546H219.941ZM227.147 15.3751V16.7931H227.207C227.914 15.679 228.864 15.0916 230.278 15.0916C232.419 15.0916 233.854 16.7121 233.854 18.9808V25.7668H231.106V19.3859C231.106 18.2718 230.46 17.4818 229.308 17.4818C228.096 17.4818 227.207 18.4541 227.207 19.8721V25.7668H224.459V15.3751H227.147ZM240.113 29.3117C237.285 29.3117 235.548 28.0963 235.265 26.0706H237.992C238.214 26.7188 238.8 27.2252 240.073 27.2252C241.629 27.2252 242.376 26.4757 242.376 25.0578V23.9234H242.316C241.71 24.6121 240.921 25.1388 239.608 25.1388C237.305 25.1388 235.043 23.3157 235.043 20.176C235.043 17.0767 236.901 15.0916 239.528 15.0916C240.82 15.0916 241.77 15.598 242.396 16.469H242.437V15.3751H245.084V24.9768C245.084 26.4352 244.619 27.4278 243.851 28.1368C242.982 28.947 241.649 29.3117 240.113 29.3117ZM240.073 22.9308C241.811 22.9308 242.518 21.6547 242.518 20.1152C242.518 18.5959 241.71 17.2995 240.053 17.2995C238.659 17.2995 237.729 18.3934 237.729 20.1354C237.729 21.8978 238.659 22.9308 240.073 22.9308Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_footer">
                                            <rect width="246" height="36" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </Link>
                        </div>
                        <p className="text-xs text-gray-500 italic mb-8">
                            Keep more of what&apos;s yours.
                        </p>
                        {/* Socials */}
                        <div className="flex items-center gap-5 text-gray-400">
                            <Link href="https://www.linkedin.com/company/vsf-holdings" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition"><Linkedin className="w-5 h-5" /></Link>
                            <Link href="https://x.com/vsfholdings" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-white transition flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </Link>
                            <Link href="https://youtube.com/@vsfholdings" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white transition"><Youtube className="w-5 h-5" /></Link>
                            <Link href="https://www.instagram.com/vsfholdings/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition"><Instagram className="w-5 h-5" /></Link>
                            <Link href="https://www.facebook.com/p/VSF-Holdings-61574929746379/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white transition"><Facebook className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Right Side: Links Group */}
                    <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start text-left mt-10 lg:mt-0">
                        {/* Column 2: Company */}
                        <div className="flex flex-col gap-6 md:mr-20">
                            <h3 className="font-bold text-white font-manrope">Company</h3>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li><Link href="https://vsfholdings.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Who We Are</Link></li>
                                <li><Link href="https://vsfholdings.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">The Platform</Link></li>
                                <li><Link href="https://vsfholdings.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Leadership</Link></li>
                                <li><Link href="https://vsfholdings.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Careers</Link></li>
                                <li><Link href="https://vsfholdings.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Why VSF</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Verticals */}
                        <div className="flex flex-col gap-6 md:mr-20">
                            <h3 className="font-bold text-white font-manrope">Verticals</h3>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li><Link href="https://vsfholdings.com/holdings/capital-markets/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">VSF Capital Markets</Link></li>
                                <li><Link href="/" className="hover:text-white transition text-left">VSF Capital Structuring</Link></li>
                                <li><Link href="https://vsfholdings.com/holdings/wealth-management/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">VSF Wealth Management</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div className="flex flex-col gap-6">
                            <h3 className="font-bold text-white font-manrope">Contact</h3>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li><Link href="mailto:info@vsfholdings.com" className="hover:text-white transition">info@vsfholdings.com</Link></li>
                                <li><span className="cursor-default">(403) 923-0681</span></li>
                                <li className="leading-relaxed">
                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=Bankers+Hall+West+Tower+Calgary"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-gray-400 hover:text-white transition-colors"
                                    >
                                        888 3rd Street SW<br />
                                        Bankers Hall, West Tower<br />
                                        Calgary, Alberta T2P 5C5
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
                    <p>© 2026 VSF Holdings Corporation - Calgary, Alberta, Canada</p>
                    <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                        <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition">Terms of Use</Link>
                        <Link href="#" className="hover:text-white transition">Risk Disclosure</Link>
                        <Link href="#" className="hover:text-white transition">Fraud Notice</Link>
                        <Link href="#" className="hover:text-white transition">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
