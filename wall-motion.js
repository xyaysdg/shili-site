/* Diagonal image field. Every card has its own trajectory; a held card is an
   obstacle, not a pause command. All distances and speeds are CSS pixels. */
(() => {
  const angle = -18 * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const smooth = t => (t = clamp(t, 0, 1)) * t * (3 - 2 * t);

  class DiagonalWall {
    constructor(wall, items, order, onOpen) {
      this.wall = wall;
      this.poetry = wall.dataset.group === 'poetry';
      // Motion basis and image orientation are independent. Images stay upright.
      this.cos = this.poetry ? 0 : cos;
      this.sin = this.poetry ? -1 : sin;
      this.viewport = wall.querySelector('.flow-viewport');
      this.layer = wall.querySelector('.flow-field');
      this.toggle = wall.querySelector('.flow-toggle');
      this.items = items;
      this.order = order;
      this.onOpen = onOpen;
      this.cards = [];
      this.selected = null;
      this.visible = false;
      this.destroyed = false;
      this.frame = 0;
      this.previousTime = 0;
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.manualPause = this.motion.matches;
      this.lastReduced = this.motion.matches;
      this.listeners = [];
      this.listen(this.toggle, 'click', () => {
        this.manualPause = !this.manualPause;
        this.update();
      });
      this.listen(this.motion, 'change', () => {
        this.manualPause = this.lastReduced = this.motion.matches;
        this.update();
      });
      this.listen(document, 'visibilitychange', () => this.update());
      this.listen(this.viewport, 'pointerover', e => {
        if (e.pointerType !== 'mouse' || this.selected) return;
        const card = this.fromTarget(e.target);
        if (card) this.hold(card, 'pointer');
      });
      this.listen(this.viewport, 'pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        if (this.selected && this.selectionMode === 'pointer') {
          const b = this.viewport.getBoundingClientRect();
          const x = e.clientX - b.left, y = e.clientY - b.top;
          const c = this.selected;
          // Keep the hit area stable during the small hover enlargement.
          if (Math.abs(x - c.holdX) > c.hitW / 2 + 12 ||
              Math.abs(y - c.holdY) > c.hitH / 2 + 12) this.release();
        }
        if (!this.selected) {
          const card = this.fromTarget(e.target);
          if (card) this.hold(card, 'pointer');
        }
      });
      this.listen(this.viewport, 'pointerleave', () => {
        if (this.selectionMode === 'pointer') this.release();
      });
      this.listen(this.layer, 'focusin', e => {
        const card = this.fromTarget(e.target);
        if (card && card.button.matches(':focus-visible')) this.hold(card, 'keyboard');
      });
      this.listen(this.layer, 'focusout', e => {
        if (this.selectionMode === 'keyboard' && !e.currentTarget.contains(e.relatedTarget)) this.release();
      });
      this.listen(this.layer, 'click', e => {
        const card = this.fromTarget(e.target);
        if (card) this.onOpen(card.index, card.button);
      });
      this.resize = new ResizeObserver(() => {
        const w = this.viewport.clientWidth, h = this.viewport.clientHeight;
        if (w !== this.width || h !== this.height) this.layout(w, h);
      });
      this.resize.observe(this.viewport);
      this.intersection = new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting;
        this.update();
      });
      this.intersection.observe(wall);
      this.mutation = new MutationObserver(() => this.update());
      this.mutation.observe(document.body, {attributes: true, attributeFilter: ['class']});
      this.layout(this.viewport.clientWidth, this.viewport.clientHeight);
    }

    listen(target, event, fn) {
      target.addEventListener(event, fn);
      this.listeners.push(() => target.removeEventListener(event, fn));
    }

    fromTarget(target) {
      const node = target.closest?.('.drift-item');
      return node && this.layer.contains(node) ? this.cards[Number(node.dataset.sprite)] : null;
    }

    layout(width, height) {
      if (!width || !height) return;
      const {cos, sin} = this;
      this.release();
      this.width = width;
      this.height = height;
      this.cards = [];
      this.layer.replaceChildren();
      const mobile = width < 550;
      const imageHeight = mobile ? 146 : this.wall.dataset.group === 'pantheon' ? 180 : 194;
      const gap = this.poetry ? (mobile ? 10 : 12) : (mobile ? 12 : 16);
      const columns = clamp(Math.floor(width / 190), 2, 6);
      const poemWidth = (width - (columns + 1) * gap) / columns;
      const projectedU = width * cos + height * Math.abs(sin);
      const projectedV = width * Math.abs(sin) + height * cos;
      const pitch = imageHeight + gap;
      const rows = this.poetry ? columns : Math.ceil(height / pitch) + 2;
      const rowStride = this.order.length <= 10 ? 3 : Math.ceil(this.order.length / rows);
      const fragment = document.createDocumentFragment();
      for (let row = 0; row < rows; row++) {
        const v = this.poetry ? -width / 2 + gap + poemWidth / 2 + row * (poemWidth + gap) : (row - (rows - 1) / 2) * pitch;
        const rowCards = [];
        let distance = 0, col = 0;
        const margin = this.poetry ? 1000 : 400;
        const start = this.poetry ? -projectedU / 2 - margin : -margin;
        // Wrap only outside the clipped viewport, with a full image of margin.
        while (distance < (this.poetry ? projectedU : width) + 2 * margin) {
          const index = this.order[(this.poetry ? col * columns + row : col + row * rowStride) % this.order.length];
          const item = this.items[index];
          const w = this.poetry ? poemWidth : imageHeight * clamp(item.width / item.height, .72, 1.85);
          const h = this.poetry ? w * item.height / item.width : imageHeight;
          const bw = w * cos + h * Math.abs(sin), bh = w * Math.abs(sin) + h * cos;
          const shell = document.createElement('div');
          shell.className = 'drift-item';
          shell.dataset.sprite = this.cards.length;
          shell.style.width = w + 'px';
          shell.style.height = h + 'px';
          const button = document.createElement('button');
          button.className = 'drift-card';
          button.dataset.gallery = this.wall.dataset.group;
          button.dataset.index = index;
          button.setAttribute('aria-label', '放大' + (item.caption || '作品 ' + (index + 1)));
          const image = document.createElement('img');
          image.src = item.thumb || item.src;
          image.alt = item.caption || '';
          image.draggable = false;
          image.decoding = 'async';
          const caption = document.createElement('span');
          caption.className = 'drift-caption';
          const title = document.createElement('span');
          title.textContent = item.caption || '';
          const number = document.createElement('small');
          number.textContent = String(index + 1).padStart(2, '0') + ' ↗';
          caption.append(title, number);
          button.append(image, caption);
          shell.append(button);
          fragment.append(shell);
          const card = {shell, button, index, row, w, h, bw, bh,
            u: start + distance + bw / 2, v, offsetX: 0, offsetY: 0, x: 0, y: 0,
            bx: start + distance + w / 2 + (row % 3) * 67,
            by: (row - .5) * pitch, verticalCycle: rows * pitch};
          this.cards.push(card);
          rowCards.push(card);
          distance += (this.poetry ? bw : w) + gap;
          col++;
        }
        rowCards.forEach(card => {
          card.cycle = distance;
          card.start = start;
          card.u += (row % 3) * 83;
        });
      }
      this.layer.append(fragment);
      this.paint(0);
      this.update();
    }

    hold(card, mode) {
      if (this.selected === card) return;
      this.release();
      this.selected = card;
      this.selectionMode = mode;
      card.holdX = card.x;
      card.holdY = card.y;
      if (mode === 'keyboard') {
        card.holdX = clamp(card.x, card.w * .5125 + 8, this.width - card.w * .5125 - 8);
        const inset = Math.min(card.h * .5125 + 8, this.height / 2);
        card.holdY = clamp(card.y, inset, this.height - inset);
      }
      card.hitW = card.w * 1.025;
      card.hitH = card.h * 1.025;
      card.shell.classList.add('is-selected');
      this.wall.classList.add('has-selection');
      this.update();
    }

    release() {
      if (!this.selected) return;
      this.selected.shell.classList.remove('is-selected');
      this.selected = null;
      this.selectionMode = null;
      this.wall.classList.remove('has-selection');
      this.update();
    }

    update() {
      if (this.destroyed) return;
      this.stopped = this.manualPause || !this.visible || document.hidden ||
        document.body.classList.contains('modal-open');
      this.toggle.textContent = this.manualPause ? '继续流动 ▷' : '暂停流动 Ⅱ';
      this.toggle.setAttribute('aria-pressed', String(this.manualPause));
      this.wall.dataset.motion = this.stopped ? 'paused' : 'running';
      if (!this.frame && this.visible && !document.hidden) {
        this.previousTime = 0;
        this.frame = requestAnimationFrame(time => this.tick(time));
      }
    }

    tick(time) {
      this.frame = 0;
      if (this.destroyed || !this.visible || document.hidden) return;
      // Some embedded browsers update media matches before dispatching change.
      if (this.lastReduced !== this.motion.matches) {
        this.manualPause = this.lastReduced = this.motion.matches;
        this.update();
      }
      const dt = this.previousTime ? Math.min((time - this.previousTime) / 1000, .05) : 0;
      this.previousTime = time;
      this.paint(dt);
      // Reduced motion and manual pause consume no continuous animation work.
      if (!this.stopped) this.frame = requestAnimationFrame(t => this.tick(t));
    }

    paint(dt) {
      const p = this.selected;
      const speed = this.stopped ? 0 : this.poetry ? 11 : 18;
      const vx = this.poetry ? 0 : -this.cos * speed;
      const vy = this.poetry ? speed : -this.sin * speed;
      const ease = this.motion.matches ? 1 : 1 - Math.exp(-dt / .16);
      const returnEase = this.motion.matches ? 1 : 1 - Math.exp(-dt / .55);
      for (const c of this.cards) {
        if (this.poetry) {
          c.u -= speed * dt;
          if (c.u + c.bw / 2 < c.start) c.u += c.cycle;
          c.bx = this.width / 2 + c.v;
          c.by = this.height / 2 - c.u;
        } else {
          c.bx += vx * dt;
          c.by += vy * dt;
          if (c.bx + c.w / 2 < c.start) c.bx += c.cycle;
          if (c.by - c.h / 2 > this.height) c.by -= c.verticalCycle;
        }
      }
      const fitted = new Map();
      if (p && !this.stopped) {
        const occupied = [{x:p.holdX, y:p.holdY, w:p.w*1.025, h:p.h*1.025}];
        const ordered = this.cards.filter(c=>c!==p).sort((a,b)=>
          Math.hypot(a.bx-p.holdX,a.by-p.holdY)-Math.hypot(b.bx-p.holdX,b.by-p.holdY));
        const intersects = (a,b) => Math.abs(a.x-b.x)<(a.w+b.w)/2+5 &&
          Math.abs(a.y-b.y)<(a.h+b.h)/2+5;
        for(const c of ordered){
          let box={x:c.bx,y:c.by,w:c.w,h:c.h};
          const sx=Math.sign(c.bx-p.holdX)||1, sy=Math.sign(c.by-p.holdY)||1;
          for(let pass=0;pass<occupied.length+1;pass++){
            const hit=occupied.find(b=>intersects(box,b));
            if(!hit)break;
            const x=hit.x+sx*((hit.w+c.w)/2+7);
            const y=hit.y+sy*((hit.h+c.h)/2+7);
            // Resolve actual touching edges only. A small local queue adjustment
            // prevents trailing images piling up behind a held neighbor.
            if(Math.abs(x-box.x)<Math.abs(y-box.y))box.x=x;else box.y=y;
          }
          occupied.push(box);
          fitted.set(c,box);
        }
      }
      for (const c of this.cards) {
        if (c === p) {
          c.x = c.holdX;
          c.y = c.holdY;
          c.offsetX = c.x - c.bx;
          c.offsetY = c.y - c.by;
        } else {
          const box=fitted.get(c);
          const tx=box?box.x-c.bx:0, ty=box?box.y-c.by:0;
          if (!this.stopped) {
            // Bounded settling also prevents a held image flying across the
            // frame when released after a long hover.
            const blend = p ? ease : returnEase;
            const limit = (p ? 75 : 95) * dt;
            c.offsetX += clamp((tx - c.offsetX) * blend, -limit, limit);
            c.offsetY += clamp((ty - c.offsetY) * blend, -limit, limit);
          }
          c.x = c.bx + c.offsetX;
          c.y = c.by + c.offsetY;
        }
        c.shell.style.transform = `translate3d(${(c.x - c.w / 2).toFixed(3)}px,${(c.y - c.h / 2).toFixed(3)}px,0)`;
        const onScreen = c.x > 24 && c.x < this.width - 24 && c.y > 24 && c.y < this.height - 24;
        c.button.tabIndex = onScreen || c === p ? 0 : -1;
      }
    }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.frame);
      this.resize.disconnect();
      this.intersection.disconnect();
      this.mutation.disconnect();
      this.listeners.forEach(off => off());
    }
  }
  window.DiagonalWall = DiagonalWall;
})();
