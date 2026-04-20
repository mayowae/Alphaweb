import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', username='root', password='96eUC4aTbMu1o3yAP2')

new_config = r"""module.exports = {
    darkMode: ['class'],
    content: [
  './src/app/**/*.{js,ts,jsx,tsx}',
  './src/pages/**/*.{js,ts,jsx,tsx}',
  './src/components/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
],
  theme: {
  	extend: {
  		fontFamily: {
  			geist: [
  				'var(--font-geist-sans)'
  			],
  			geistMono: [
  				'var(--font-geist-mono)'
  			],
  			inter: [
  				'var(--font-inter)',
  				'sans-serif'
  			],
  			poppins: [
  				'var(--font-poppins)',
  				'sans-serif'
  			],
  			lato: [
  				'var(--font-lato)',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
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
  			}
  		},
		backgroundImage: {
            'custom-143': 'linear-gradient(143.66deg, #150E46 16.69%, #3322AC 137.55%)',
        },
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
"""

sftp = client.open_sftp()
with sftp.open('/home/mayowae/public_html/alphaweb/tailwind.config.js', 'w') as f:
    f.write(new_config)
sftp.close()
print('tailwind.config.js updated successfully')

# Also apply to local file
with open(r'c:\Users\trade\Documents\Alphaweb-main\tailwind.config.js', 'w') as f:
    f.write(new_config)
print('Local tailwind.config.js also updated')

# Trigger a rebuild
stdin, stdout, stderr = client.exec_command(
    'cd /home/mayowae/public_html/alphaweb && export NODE_OPTIONS=--max-old-space-size=4096 && nohup npm run build > build_tailwind_fix.log 2>&1 &'
)
print('Build triggered. Check build_tailwind_fix.log on server for progress.')
client.close()
