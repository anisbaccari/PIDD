<template>
  <div :class="['share-buttons', { compact }]">
    <h3 v-if="!compact" class="share-title">📢 Partager</h3>
    
    <div class="buttons-grid">
      <!-- Facebook -->
      <button @click="share('facebook')" class="share-btn facebook" title="Partager sur Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span v-if="!compact">Facebook</span>
      </button>

      <!-- Twitter / X -->
      <button @click="share('twitter')" class="share-btn twitter" title="Partager sur X">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span v-if="!compact">X</span>
      </button>

      <!-- WhatsApp -->
      <button @click="share('whatsapp')" class="share-btn whatsapp" title="Partager sur WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span v-if="!compact">WhatsApp</span>
      </button>

      <!-- Pinterest (si image) -->
      <button v-if="image" @click="share('pinterest')" class="share-btn pinterest" title="Épingler">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
        <span v-if="!compact">Pinterest</span>
      </button>

      <!-- Copier lien -->
      <button @click="copyLink" class="share-btn copy" :class="{ copied }" title="Copier le lien">
        <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span v-if="!compact">{{ copied ? 'Copié !' : 'Copier' }}</span>
      </button>
    </div>

    <!-- Message copié -->
    <transition name="fade">
      <div v-if="copied" class="copied-toast">✅ Lien copié !</div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ShareButtons',
  
  props: {
    url: { 
      type: String, 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      default: '' 
    },
    image: { 
      type: String, 
      default: '' 
    },
    compact: { 
      type: Boolean, 
      default: false 
    }
  },

  data() {
    return {
      copied: false
    }
  },

  methods: {
    share(platform) {
      const url = encodeURIComponent(this.url)
      const title = encodeURIComponent(this.title)
      const description = encodeURIComponent(this.description)
      const image = encodeURIComponent(this.image)

      const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=MonShop,TshirtPremium`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        whatsapp: `https://wa.me/?text=${title}%20${url}`,
        pinterest: this.image 
          ? `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${description}`
          : null
      }

      if (urls[platform]) {
        window.open(
          urls[platform], 
          'share', 
          'width=600,height=500,toolbar=no,location=no,status=no,menubar=no'
        )
      }
    },

    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.url)
        this.copied = true
        
        setTimeout(() => {
          this.copied = false
        }, 2000)
      } catch (err) {
        console.error('Erreur copie:', err)
        
        // Fallback pour anciens navigateurs
        const textArea = document.createElement('textarea')
        textArea.value = this.url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 2000)
      }
    }
  }
}
</script>

<style scoped>
.share-buttons {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

.share-buttons.compact {
  padding: 0;
  background: transparent;
  margin: 0;
}

.share-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.buttons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  white-space: nowrap;
}

.compact .share-btn {
  padding: 0.6rem;
}

.compact .share-btn span {
  display: none;
}

.share-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.share-btn:active {
  transform: translateY(0);
}

.share-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Couleurs spécifiques */
.facebook { 
  background: linear-gradient(135deg, #1877f2 0%, #0c63d4 100%); 
}

.twitter { 
  background: linear-gradient(135deg, #000 0%, #434343 100%); 
}

.whatsapp { 
  background: linear-gradient(135deg, #25d366 0%, #1da851 100%); 
}

.pinterest { 
  background: linear-gradient(135deg, #e60023 0%, #c8001e 100%); 
}

.copy { 
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%); 
}

.copy.copied { 
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); 
}

.copied-toast {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  border: 1px solid #c3e6cb;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .share-buttons {
    padding: 1rem;
  }

  .buttons-grid {
    justify-content: center;
    gap: 0.5rem;
  }
  
  .share-btn span {
    display: none;
  }
  
  .share-btn {
    padding: 0.75rem;
    min-width: 50px;
  }

  .share-title {
    text-align: center;
    font-size: 1rem;
  }
}
</style>