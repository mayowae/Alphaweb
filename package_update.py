import tarfile
import os

def create_tarball(output_filename, source_dir):
    with tarfile.open(output_filename, "w:gz") as tar:
        # Define directories and files to include
        includes = [
            'backend',
            'src',
            'components',
            'services',
            'interface',
            'public',
            'package.json',
            'package-lock.json',
            'tsconfig.json',
            'next.config.ts',
            'postcss.config.js',
            'tailwind.config.ts',
            'global.css'
        ]
        
        for item in includes:
            path = os.path.join(source_dir, item)
            if os.path.exists(path):
                if os.path.isdir(path):
                    # Add directory but exclude node_modules
                    for root, dirs, files in os.walk(path):
                        if 'node_modules' in dirs:
                            dirs.remove('node_modules')
                        if '.git' in dirs:
                            dirs.remove('.git')
                        if '.next' in dirs:
                            dirs.remove('.next')
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, source_dir)
                            tar.add(file_path, arcname=arcname)
                else:
                    tar.add(path, arcname=item)
    print(f"Created {output_filename}")

if __name__ == "__main__":
    create_tarball("alphaweb_update.tar.gz", r"c:\Users\trade\Documents\Alphaweb-main")
