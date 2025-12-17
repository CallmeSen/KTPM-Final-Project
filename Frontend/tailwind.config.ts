import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}', 
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
    	extend: {
    		colors: {
    			customBlue: '#294563',
    			customMintBlue: '#D6F0F4',
    			customeBlack: '#282828',
    			customebrightBlue: '#33B2C7',
    			customRed: '#c76478',
    			customYellow: '#f9a95a',
    			customGreen: '#0ec122',
    			customGrenn1: '#327846',
    			customWhite: '#f5f5f5',
    			customboldWhite: '#fff',
    			customergray: '#707070',
    			lightWhite: ' #FFFFFF',
    			darkWhite: '#F1F1F1',
    			customelightWhite: '#D6F0F4',
    			naturalgrey: '#D6F0F4',
    			customWhile1: '#fff',
    			Solid_while_color: '#EAECEF',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		backgroundImage: {
    			'custom-gradient': 'linear-gradient(91.95deg, rgba(255, 255, 255, 0.552) -1.75%, rgba(255, 255, 255, 0.72) 97.46%)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		boxShadow: {
    			'glow-orange': '-4px 4px 10px rgba(248, 184, 78, 0.6)',
    			'glow-red': '-4px 4px 10px rgba(219, 98, 120, 0.6)',
    			'glow-green': '-4px 4px 10px rgba(74, 165, 100, 0.6)'
    		}
    	}
    },
	
	plugins: [],
};
export default config;
