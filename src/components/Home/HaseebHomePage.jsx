import React, { useState } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, BarChart3, PieChart, Target, ArrowRight, CheckCircle, Coffee, Lightbulb, Shield, Receipt, CreditCard, Coins, Moon } from 'lucide-react';
import './HaseebHomePage.css';
import { useNavigate } from 'react-router-dom';


export default function HaseebHomePage({ onGetStarted }) {
    const navigate = useNavigate();

    const [activeCard, setActiveCard] = useState(null);
    const [activeSection, setActiveSection] = useState('home');

    const backgroundElements = [
        { icon: Coffee, class: 'float-1', delay: '0s' },
        { icon: DollarSign, class: 'float-2', delay: '2s' },
        { icon: TrendingUp, class: 'float-3', delay: '4s' },
        { icon: BarChart3, class: 'float-4', delay: '1s' },
        { icon: PieChart, class: 'float-5', delay: '3s' },
        { icon: Receipt, class: 'float-6', delay: '5s' },
        { icon: CreditCard, class: 'float-7', delay: '2.5s' },
        { icon: Coins, class: 'float-8', delay: '4.5s' },
        { icon: Coffee, class: 'float-9', delay: '1.5s' },
        { icon: Target, class: 'float-10', delay: '3.5s' }
    ];

    const terminology = [
        {
            id: 1,
            icon: <Target className="term-icon" />,
            title: "Break Even",
            subtitle: "Your Zero-Profit Point",
            description: "The point where your total revenue equals total costs. Know exactly when your business becomes profitable and make informed decisions about pricing and growth.",
            colorClass: "color-primary"
        },
        {
            id: 2,
            icon: <TrendingUp className="term-icon" />,
            title: "Cash Flow",
            subtitle: "Money Movement",
            description: "Track money coming in and going out of your business. Positive cash flow means more money in than out - the lifeblood of your business health.",
            colorClass: "color-dark"
        },
        {
            id: 3,
            icon: <DollarSign className="term-icon" />,
            title: "Profit Per Unit",
            subtitle: "Unit Economics",
            description: "How much profit you make on each item or service sold. Calculate by subtracting the cost per unit from the selling price to understand true profitability.",
            colorClass: "color-success"
        },
        {
            id: 4,
            icon: <PieChart className="term-icon" />,
            title: "Profit Margin",
            subtitle: "Profitability Percentage",
            description: "Your profit as a percentage of revenue. A 20% margin means you keep $20 for every $100 in sales. Higher margins indicate better financial health.",
            colorClass: "color-primary"
        },
        {
            id: 5,
            icon: <BarChart3 className="term-icon" />,
            title: "Fixed Cost",
            subtitle: "Constant Expenses",
            description: "Costs that stay the same regardless of sales - like rent, salaries, and insurance. Understanding fixed costs helps you plan your minimum revenue needs.",
            colorClass: "color-dark"
        },
        {
            id: 6,
            icon: <TrendingUp className="term-icon" />,
            title: "Variable Cost",
            subtitle: "Flexible Expenses",
            description: "Costs that change with production volume - like materials and shipping. These scale with your business, so managing them is key to profitability.",
            colorClass: "color-success"
        },
        {
            id: 7,
            icon: <DollarSign className="term-icon" />,
            title: "Balance",
            subtitle: "Current Cash Position",
            description: "Your available cash at any given moment. Monitor your balance to ensure you can cover expenses and avoid cash crunches.",
            colorClass: "color-primary"
        },
        {
            id: 8,
            icon: <AlertTriangle className="term-icon" />,
            title: "Shortfall",
            subtitle: "Cash Deficit Alert",
            description: "When expenses exceed your cash balance. HASEEB alerts you before shortfalls occur, giving you time to secure funding or adjust spending.",
            colorClass: "color-error"
        },
        {
            id: 9,
            icon: <AlertTriangle className="term-icon" />,
            title: "Danger Zone",
            subtitle: "Critical Threshold",
            description: "Your customizable alert threshold. Set your danger zone to receive warnings before your balance drops too low, ensuring you stay financially secure.",
            colorClass: "color-error"
        }
    ];

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Handle Get Started button click
    const handleGetStarted = () => {
        if (onGetStarted) {
            onGetStarted();

        } else {
                navigate('/auth'); // Navigate to auth page
        }
    };
    // Update active section on scroll
    React.useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'about', 'terminology', 'get-started'];
            const scrollPosition = window.scrollY + 100;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="haseeb-homepage">
            {/* Fixed Header */}
            <header className="header-fixed">
                <div className="header-container">

                    <nav className="header-nav">
                        <button
                            onClick={() => scrollToSection('home')}
                            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection('about')}
                            className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => scrollToSection('terminology')}
                            className={`nav-link ${activeSection === 'terminology' ? 'active' : ''}`}
                        >
                            Terminology
                        </button>
                        <button
                            onClick={() => scrollToSection('get-started')}
                            className={`nav-link ${activeSection === 'get-started' ? 'active' : ''}`}
                        >
                            Get Started
                        </button>
                    </nav>
                </div>
            </header>

            {/* Animated Background */}
            <div className="animated-background">
                {backgroundElements.map((element, index) => {
                    const Icon = element.icon;
                    return (
                        <div
                            key={index}
                            className={`float-element ${element.class}`}
                            style={{ animationDelay: element.delay }}
                        >
                            <Icon className="bg-icon" />
                        </div>
                    );
                })}
            </div>

            {/* Hero Section */}
            <div id="home" className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="logo-container">
                            <img
                                src="/assets/HaseebLogo.png"
                                alt="HASEEB Logo"
                                className="logo"
                            />
                        </div>

                        <p className="hero-description">
                            Financial clarity for coffee suppliers. Make smarter decisions with simple, powerful tools.
                        </p>

                        <button
                            className="btn-get-started"
                            onClick={handleGetStarted}
                        >
                            Get Started
                            <ArrowRight className="btn-icon"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* What is HASEEB Section */}
            <div id="about" className="what-is-section">
                <div className="container">
                    <h2 className="what-is-title">
                        What is <span className="text-primary-gradient">HASEEB</span>?
                    </h2>

                    <div className="what-is-content">
                        <div className="description-card">
                            <div className="description-icon">
                                <Coffee className="icon-large" />
                            </div>
                            <p className="description-text">
                                Haseeb is a <strong>lightweight financial management toolkit</strong> created specifically for small suppliers in
                                the coffee supply industry. Instead of overwhelming users with the complexity of full accounting
                                systems, Haseeb delivers <strong>three focused tools</strong> that address the real challenges coffee suppliers face.
                            </p>
                        </div>

                        <div className="tools-grid">
                            <div className="tool-card">
                                <div className="tool-icon-wrapper primary">
                                    <Target className="tool-icon" />
                                </div>
                                <h3 className="tool-title">Break-Even Simulator</h3>
                                <p className="tool-description">
                                    Test different combinations of costs, prices, and sales volumes to understand exactly
                                    how many units of beans, cups, or other supplies must be sold to cover expenses.
                                </p>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon-wrapper success">
                                    <Shield className="tool-icon" />
                                </div>
                                <h3 className="tool-title">Cash Flow Danger Zone</h3>
                                <p className="tool-description">
                                    Highlights upcoming weeks or months when outgoing costs such as packaging, shipping,
                                    or restocking may exceed incoming payments, helping you anticipate and avoid shortfalls.
                                </p>
                            </div>

                            <div className="tool-card">
                                <div className="tool-icon-wrapper dark">
                                    <Lightbulb className="tool-icon" />
                                </div>
                                <h3 className="tool-title">Pricing Experiment Simulator</h3>
                                <p className="tool-description">
                                    Explore "what-if" scenarios by adjusting product prices and instantly seeing the projected
                                    impact on revenue and profit.
                                </p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <p className="summary-text">
                                With these tools combined, Haseeb empowers small coffee supply businesses to make smarter financial
                                decisions, manage risks effectively, and grow sustainably in a competitive market.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terminology Section */}
            <div id="terminology" className="terminology-section">
                <div className="container">
                    <h2 className="section-title">
                        Understand the Language of Data
                    </h2>
                    <p className="section-subtitle">
                        Click any card, learn more, and  Master key concepts!
                    </p>

                    <div className="terminology-grid">
                        {terminology.map((term) => (
                            <div
                                key={term.id}
                                onClick={() => setActiveCard(activeCard === term.id ? null : term.id)}
                                className={`term-card ${activeCard === term.id ? 'active' : ''} ${term.colorClass}`}
                            >
                                <div className="term-icon-wrapper">
                                    {term.icon}
                                </div>

                                <h3 className="term-title">{term.title}</h3>
                                <p className="term-subtitle">{term.subtitle}</p>

                                <div className={`term-description ${activeCard === term.id ? 'expanded' : ''}`}>
                                    <p>{term.description}</p>
                                </div>

                                {activeCard !== term.id && (
                                    <div className="term-hint">
                                        <span>Click to learn more</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div id="get-started" className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2 className="cta-title">Ready to Simplify Your Financial Management?</h2>
                        <p className="cta-description">
                            Join coffee suppliers who are making smarter decisions with HASEEB
                        </p>
                        <button className="btn-cta-primary"
                                onClick={handleGetStarted}
                        >
                            Get Started
                            <ArrowRight className="btn-icon" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="footer">
                <div className="container">
                    <p className="footer-text">© 2025 HASEEB | Every Decision Counts</p>
                </div>
            </div>
        </div>
    );
}