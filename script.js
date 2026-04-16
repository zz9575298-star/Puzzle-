// Royal Image Puzzle Game - Complete JavaScript Implementation

class RoyalPuzzleGame {
    constructor() {
        this.currentLevel = 'easy';
        this.gridSize = 3;
        this.pieces = [];
        this.selectedPiece = null;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.currentImage = null;
        this.soundEnabled = true;
        this.isGameActive = false;
        this.draggedPiece = null;
        
        // Single array of 15 high-quality curated images from Unsplash
        this.gameImages = [
            // --- Flowers (5) - Beautiful floral arrangements
            "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&h=800&fit=crop&auto=format",

            // --- Vintage Books (5) - Classic library and book collections
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop&auto=format",

            // --- Ancient Cities (5) - Historic architecture and ruins
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=800&h=800&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&h=800&fit=crop&auto=format"
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadImageOptions();
        this.loadLeaderboard();
        this.createScrambledPreview();
        this.initializeGame();
    }
    
    setupEventListeners() {
        // Level selection
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectLevel(e.target.dataset.level);
            });
        });
        
        // Game controls
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shufflePuzzle());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Hint button
        const hintBtn = document.getElementById('hintBtn');
        let hintTimeout;
        
        hintBtn.addEventListener('mousedown', () => {
            hintTimeout = setTimeout(() => {
                this.showHint();
            }, 500);
        });
        
        hintBtn.addEventListener('mouseup', () => {
            clearTimeout(hintTimeout);
            this.hideHint();
        });
        
        hintBtn.addEventListener('mouseleave', () => {
            clearTimeout(hintTimeout);
            this.hideHint();
        });
        
        // Custom image upload
        document.getElementById('customImage').addEventListener('change', (e) => {
            this.handleCustomImageUpload(e);
        });
        
        // Touch events for mobile
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        const board = document.getElementById('puzzleBoard');
        
        board.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element && element.classList.contains('puzzle-piece')) {
                this.handlePieceSelection(element);
            }
        });
    }
    
    loadImageOptions() {
        const imageGrid = document.querySelector('.image-grid');
        imageGrid.innerHTML = '';
        
        // Add category headers
        const categories = [
            { name: 'Flowers', start: 0, end: 5, icon: 'flowers' },
            { name: 'Vintage Books', start: 5, end: 10, icon: 'books' },
            { name: 'Ancient Cities', start: 10, end: 15, icon: 'city' }
        ];
        
        categories.forEach(category => {
            // Add category header
            const header = document.createElement('div');
            header.className = 'col-span-2 text-center mb-2';
            header.innerHTML = `
                <h3 class="text-lg font-bold text-amber-900">
                    <span class="text-2xl mr-2">${category.icon === 'flowers' ? 'flowers' : category.icon === 'books' ? 'books' : 'cityscape'}</span>
                    ${category.name}
                </h3>
            `;
            imageGrid.appendChild(header);
            
            // Add images for this category
            for (let i = category.start; i < category.end; i++) {
                const imageUrl = this.gameImages[i];
                const imageOption = document.createElement('div');
                imageOption.className = 'image-option aspect-square relative group';
                imageOption.innerHTML = `
                    <img src="${imageUrl}" alt="${category.name} puzzle image ${i - category.start + 1}" 
                         class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <span class="text-white opacity-0 group-hover:opacity-100 font-bold text-sm">${i - category.start + 1}</span>
                    </div>
                `;
                
                imageOption.addEventListener('click', () => {
                    this.selectImage(imageUrl, imageOption);
                });
                
                imageGrid.appendChild(imageOption);
            }
        });
        
        // Select first image by default
        if (imageGrid.querySelector('.image-option')) {
            this.selectImage(this.gameImages[0], imageGrid.querySelector('.image-option'));
        }
    }
    
    selectLevel(level) {
        this.currentLevel = level;
        this.gridSize = level === 'easy' ? 3 : level === 'medium' ? 4 : 5;
        
        // Update button styles
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-yellow-400');
        });
        document.querySelector(`[data-level="${level}"]`).classList.add('ring-4', 'ring-yellow-400');
        
        this.resetGame();
    }
    
    selectImage(imageUrl, element) {
        this.currentImage = imageUrl;
        
        // Update selection styles
        document.querySelectorAll('.image-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        element.classList.add('selected');
        
        // Update hint preview with error handling
        const hintImage = document.getElementById('hintImage');
        hintImage.onerror = () => {
            console.error('Failed to load hint image:', imageUrl);
            hintImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iI2Y1ZTZkMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjM2UyNzIzIj5JbWFnZSBMb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
        };
        hintImage.src = imageUrl;
        
        // Auto-shuffle puzzle when image is selected
        this.resetGame();
        setTimeout(() => {
            this.shufflePuzzle();
        }, 500); // Small delay to allow image to load
    }
    
    handleCustomImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentImage = e.target.result;
                document.getElementById('hintImage').src = this.currentImage;
                
                // Clear image selection
                document.querySelectorAll('.image-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Show loading indicator
                const board = document.getElementById('puzzleBoard');
                board.innerHTML = '<div class="flex items-center justify-center h-full"><div class="loading"></div></div>';
                
                // Initialize game with custom image
                this.initializeGame();
            };
            reader.onerror = () => {
                console.error('Failed to read uploaded file');
                alert('Failed to load the uploaded image. Please try another file.');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file.');
        }
    }
    
    initializeGame() {
        if (!this.currentImage) return;
        
        // Preload the image before rendering
        this.preloadImage(this.currentImage).then(() => {
            this.createPuzzlePieces();
            this.renderPuzzle();
            this.updateProgress();
        }).catch((error) => {
            console.error('Failed to load image:', error);
            // Use a fallback gradient background
            this.currentImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjhmMDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0idXJsKCNncmFkKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjMyIiBmaWxsPSIjM2UyNzIzIiBmb250LWZhbWlseT0ic2VyaWYiPVB1enpsZTwvdGV4dD48L3N2Zz4=';
            this.createPuzzlePieces();
            this.renderPuzzle();
            this.updateProgress();
        });
    }
    
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}, trying fallback...`);
                // Create a fallback image
                const fallbackImg = new Image();
                fallbackImg.onload = () => resolve(fallbackImg);
                fallbackImg.onerror = () => reject(new Error(`Failed to load fallback image`));
                fallbackImg.src = this.createFallbackImage(url);
            };
            img.src = url;
        });
    }
    
    createFallbackImage(originalUrl) {
        // Create a themed fallback based on the original URL
        let theme = 'gradient';
        if (originalUrl.includes('flower')) {
            theme = 'flower';
        } else if (originalUrl.includes('book')) {
            theme = 'books';
        } else if (originalUrl.includes('city') || originalUrl.includes('ancient')) {
            theme = 'city';
        }
        
        const colors = {
            flower: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#C71585'],
            books: ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887'],
            city: ['#708090', '#778899', '#696969', '#2F4F4F', '#000080'],
            gradient: ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500']
        };
        
        const themeColors = colors[theme] || colors.gradient;
        const gradient = `linear-gradient(135deg, ${themeColors[0]} 0%, ${themeColors[1]} 25%, ${themeColors[2]} 50%, ${themeColors[3]} 75%, ${themeColors[4]} 100%)`;
        
        // Create SVG with gradient
        const svg = `
            <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${themeColors[0]};stop-opacity:1" />
                        <stop offset="50%" style="stop-color:${themeColors[2]};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${themeColors[4]};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="800" height="800" fill="url(#grad)"/>
                <text x="400" y="400" font-family="serif" font-size="48" fill="white" text-anchor="middle">${theme.toUpperCase()}</text>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
    
    createPuzzlePieces() {
        this.pieces = [];
        const totalPieces = this.gridSize * this.gridSize;
        
        for (let i = 0; i < totalPieces; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            
            this.pieces.push({
                id: i,
                currentPosition: i,
                correctPosition: i,
                row: row,
                col: col,
                isCorrect: true
            });
        }
    }
    
    renderPuzzle() {
        const board = document.getElementById('puzzleBoard');
        board.innerHTML = '';
        
        const boardSize = board.clientWidth;
        const pieceSize = boardSize / this.gridSize;
        
        this.pieces.forEach((piece, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'puzzle-piece';
            pieceElement.dataset.pieceId = piece.id;
            pieceElement.style.width = `${pieceSize}px`;
            pieceElement.style.height = `${pieceSize}px`;
            pieceElement.style.left = `${(piece.currentPosition % this.gridSize) * pieceSize}px`;
            pieceElement.style.top = `${Math.floor(piece.currentPosition / this.gridSize) * pieceSize}px`;
            
            // Set background image
            const correctRow = Math.floor(piece.correctPosition / this.gridSize);
            const correctCol = piece.correctPosition % this.gridSize;
            
            pieceElement.style.backgroundImage = `url(${this.currentImage})`;
            pieceElement.style.backgroundSize = `${boardSize}px ${boardSize}px`;
            pieceElement.style.backgroundPosition = `-${correctCol * pieceSize}px -${correctRow * pieceSize}px`;
            
            // Add event listeners
            pieceElement.addEventListener('click', () => this.handlePieceSelection(pieceElement));
            pieceElement.draggable = true;
            
            pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, pieceElement));
            pieceElement.addEventListener('dragover', (e) => this.handleDragOver(e));
            pieceElement.addEventListener('drop', (e) => this.handleDrop(e, pieceElement));
            pieceElement.addEventListener('dragend', () => this.handleDragEnd());
            
            board.appendChild(pieceElement);
        });
    }
    
    handlePieceSelection(pieceElement) {
        if (!this.isGameActive) return;
        
        if (this.selectedPiece === null) {
            this.selectedPiece = pieceElement;
            pieceElement.classList.add('selected');
            this.playSound('click');
        } else if (this.selectedPiece === pieceElement) {
            pieceElement.classList.remove('selected');
            this.selectedPiece = null;
        } else {
            this.swapPieces(this.selectedPiece, pieceElement);
            this.selectedPiece.classList.remove('selected');
            this.selectedPiece = null;
        }
    }
    
    handleDragStart(e, pieceElement) {
        if (!this.isGameActive) return;
        
        this.draggedPiece = pieceElement;
        pieceElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        this.playSound('click');
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDrop(e, targetPiece) {
        e.preventDefault();
        if (this.draggedPiece && this.draggedPiece !== targetPiece) {
            this.swapPieces(this.draggedPiece, targetPiece);
        }
    }
    
    handleDragEnd() {
        if (this.draggedPiece) {
            this.draggedPiece.classList.remove('dragging');
            this.draggedPiece = null;
        }
    }
    
    swapPieces(piece1, piece2) {
        const piece1Id = parseInt(piece1.dataset.pieceId);
        const piece2Id = parseInt(piece2.dataset.pieceId);
        
        const piece1Data = this.pieces.find(p => p.id === piece1Id);
        const piece2Data = this.pieces.find(p => p.id === piece2Id);
        
        // Swap positions
        const tempPosition = piece1Data.currentPosition;
        piece1Data.currentPosition = piece2Data.currentPosition;
        piece2Data.currentPosition = tempPosition;
        
        // Update visual positions
        const board = document.getElementById('puzzleBoard');
        const boardSize = board.clientWidth;
        const pieceSize = boardSize / this.gridSize;
        
        const piece1Left = `${(piece1Data.currentPosition % this.gridSize) * pieceSize}px`;
        const piece1Top = `${Math.floor(piece1Data.currentPosition / this.gridSize) * pieceSize}px`;
        const piece2Left = `${(piece2Data.currentPosition % this.gridSize) * pieceSize}px`;
        const piece2Top = `${Math.floor(piece2Data.currentPosition / this.gridSize) * pieceSize}px`;
        
        piece1.style.left = piece1Left;
        piece1.style.top = piece1Top;
        piece2.style.left = piece2Left;
        piece2.style.top = piece2Top;
        
        this.moves++;
        document.getElementById('moveCount').textContent = this.moves;
        
        this.playSound('move');
        this.checkWinCondition();
        this.updateProgress();
    }
    
    shufflePuzzle() {
        if (!this.currentImage) return;
        
        // Fisher-Yates shuffle for positions
        const positions = Array.from({length: this.gridSize * this.gridSize}, (_, i) => i);
        
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Ensure puzzle is solvable
        if (!this.isSolvable(positions)) {
            // Swap two pieces to make it solvable
            [positions[0], positions[1]] = [positions[1], positions[0]];
        }
        
        // Apply shuffled positions
        this.pieces.forEach((piece, index) => {
            piece.currentPosition = positions[index];
            piece.isCorrect = piece.currentPosition === piece.correctPosition;
        });
        
        this.renderPuzzle();
        this.startGame();
        this.playSo
