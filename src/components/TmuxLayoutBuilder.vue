<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Theme Toggle -->
    <div class="fixed top-4 right-4 z-50">
      <button
        @click="toggleTheme"
        class="p-2 rounded-md border border-border bg-background hover:bg-accent transition-colors"
      >
        <SunIcon
          v-if="theme === 'dark'"
          class="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
        />
        <MoonIcon
          v-else
          class="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
        />
      </button>
    </div>

    <!-- Export Dialog -->
    <div
      v-if="showExportDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-border"
        >
          <div class="flex items-center gap-2">
            <FileTextIcon class="w-5 h-5" />
            <h2 class="text-lg font-semibold">Export Layout</h2>
          </div>
          <button
            @click="showExportDialog = false"
            class="p-1 hover:bg-accent rounded"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4">
          <div class="flex border-b border-border mb-4">
            <button
              v-for="tab in exportTabs"
              :key="tab.value"
              @click="activeExportTab = tab.value"
              :class="[
                'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
                activeExportTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ]"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </button>
          </div>

          <div class="space-y-4">
            <!-- Bash Script Tab -->
            <div v-if="activeExportTab === 'script'">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium">Bash Script</h3>
                <div class="flex gap-2">
                  <button
                    @click="copyToClipboard(bashScript)"
                    class="flex items-center gap-2 px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    <CheckCircleIcon v-if="copied" class="w-4 h-4" />
                    <CopyIcon v-else class="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    @click="downloadFile(bashScript, 'tmux-layout.sh')"
                    class="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                  >
                    <DownloadIcon class="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <pre
                class="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 font-mono"
                >{{ bashScript }}</pre
              >
            </div>

            <!-- Commands Tab -->
            <div v-if="activeExportTab === 'commands'">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium">Manual Commands</h3>
                <div class="flex gap-2">
                  <button
                    @click="copyToClipboard(manualCommands)"
                    class="flex items-center gap-2 px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    <CheckCircleIcon v-if="copied" class="w-4 h-4" />
                    <CopyIcon v-else class="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    @click="downloadFile(manualCommands, 'tmux-commands.txt')"
                    class="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                  >
                    <DownloadIcon class="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <pre
                class="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 font-mono"
                >{{ manualCommands }}</pre
              >
            </div>

            <!-- Config Tab -->
            <div v-if="activeExportTab === 'config'">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium">JSON Configuration</h3>
                <div class="flex gap-2">
                  <button
                    @click="copyToClipboard(jsonConfig)"
                    class="flex items-center gap-2 px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    <CheckCircleIcon v-if="copied" class="w-4 h-4" />
                    <CopyIcon v-else class="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    @click="downloadFile(jsonConfig, 'tmux-config.json')"
                    class="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                  >
                    <DownloadIcon class="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <pre
                class="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 font-mono"
                >{{ jsonConfig }}</pre
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto p-6 max-w-7xl">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-3rem)]">
        <!-- Layout Builder -->
        <div class="lg:col-span-3 space-y-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">Tmux Layout Builder</h1>
            <div class="flex gap-2">
              <button
                @click="addPane"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
              >
                <PlusIcon class="w-4 h-4" />
                Add Pane
              </button>
              <button
                @click="showExportDialog = true"
                class="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                <DownloadIcon class="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <!-- Layout Preview -->
          <div
            class="border border-border rounded-lg p-4 bg-card min-h-[400px]"
          >
            <div
              class="h-full"
              :style="{ display: 'flex', flexDirection: rootDirection }"
            >
              <div
                v-for="pane in rootPanes"
                :key="pane.id"
                :style="{ flex: pane.size }"
                class="relative"
              >
                <PaneComponent
                  :pane="pane"
                  :selected-pane="selectedPane"
                  :command-templates="commandTemplates"
                  @select="selectPane"
                  @split="splitPane"
                  @update-command="updatePaneCommand"
                  @drag-start="handleDragStart"
                  @drag-over="handleDragOver"
                  @drop="handleDrop"
                />
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex gap-2 flex-wrap">
            <button
              @click="addPane"
              class="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm"
            >
              <PlusIcon class="w-4 h-4" />
              Add Pane
            </button>
            <button
              @click="resetLayout"
              class="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm"
            >
              <SettingsIcon class="w-4 h-4" />
              Reset
            </button>
            <button
              @click="selectedPane && splitPane(selectedPane, 'horizontal')"
              :disabled="!selectedPane"
              class="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/80 rounded-md text-sm disabled:opacity-50"
            >
              <SplitHorizontalIcon class="w-3 h-3" />
              Split H
            </button>
            <button
              @click="selectedPane && splitPane(selectedPane, 'vertical')"
              :disabled="!selectedPane"
              class="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/80 rounded-md text-sm disabled:opacity-50"
            >
              <SplitVerticalIcon class="w-3 h-3" />
              Split V
            </button>
          </div>
        </div>

        <!-- Command Templates Sidebar -->
        <div class="space-y-4">
          <div class="border border-border rounded-lg p-4 bg-card">
            <h2 class="text-lg font-semibold mb-4">Command Templates</h2>

            <!-- Search -->
            <div class="mb-4">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search templates..."
                class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <!-- Category Filter -->
            <div class="mb-4">
              <select
                v-model="selectedCategory"
                class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                </option>
              </select>
            </div>

            <!-- Templates List -->
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="template in filteredTemplates"
                :key="template.id"
                :draggable="true"
                @dragstart="handleTemplateDragStart($event, template)"
                class="p-3 border border-border rounded-md hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
              >
                <div class="flex items-center gap-2 mb-1">
                  <GripVerticalIcon class="w-3 h-3 text-muted-foreground" />
                  <component :is="template.icon" />
                  <span class="font-medium text-sm">{{ template.name }}</span>
                </div>
                <p class="text-xs text-muted-foreground mb-2">
                  {{ template.description }}
                </p>
                <code class="text-xs bg-muted px-2 py-1 rounded font-mono">{{
                  template.command
                }}</code>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-muted-foreground capitalize">{{
                    template.category
                  }}</span>
                  <button
                    v-if="selectedPane"
                    @click="applyTemplate(template)"
                    class="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                  <div
                    v-else
                    class="flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <AlertCircleIcon class="w-3 h-3" />
                    Select pane
                  </div>
                </div>
              </div>

              <div
                v-if="filteredTemplates.length === 0"
                class="text-center py-8 text-muted-foreground"
              >
                <BookOpenIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">No templates found</p>
              </div>
            </div>
          </div>

          <!-- Selected Pane Info -->
          <div
            v-if="selectedPane"
            class="border border-border rounded-lg p-4 bg-card"
          >
            <h3 class="font-semibold mb-2 flex items-center gap-2">
              <TerminalIcon class="w-4 h-4" />
              Selected Pane
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-muted-foreground">ID:</span>
                <span class="ml-2 font-mono">{{ selectedPaneData?.id }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Command:</span>
                <code class="ml-2 bg-muted px-2 py-1 rounded text-xs font-mono">
                  {{ selectedPaneData?.command || "bash" }}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";

// Inline SVG Icon Components
const PlusIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
};

const DownloadIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
};

const TerminalIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,17 10,11 4,5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>`,
};

const XIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

const SplitHorizontalIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3"/><path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3"/><line x1="12" x2="12" y1="4" y2="20"/></svg>`,
};

const SplitVerticalIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8V5c0-1 1-2 2-2h10c1 0 2 1 2 2v3"/><path d="M19 16v3c0 1-1 2-2 2H7c-1 0-2-1-2-2v-3"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`,
};

const SettingsIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

const BookOpenIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
};

const AlertCircleIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
};

const GripVerticalIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
};

const CopyIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
};

const FileTextIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
};

const CheckCircleIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
};

const CodeIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>`,
};

const ServerIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,
};

const DatabaseIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 3 4 6 9 6s9-3 9-6V5"/><path d="M3 12c0 3 4 6 9 6s9-3 9-6"/></svg>`,
};

const GlobeIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
};

const FolderIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
};

const MoonIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
};

const SunIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
};

// Reactive state
const theme = ref("light");
const showExportDialog = ref(false);
const activeExportTab = ref("script");
const copied = ref(false);
const selectedPane = ref(null);
const searchTerm = ref("");
const selectedCategory = ref("");
const draggedTemplate = ref(null);
const draggedPane = ref(null);

// Pane management
const panes = ref([{ id: "1", command: "bash", size: 1, children: [] }]);
const rootDirection = ref("row");

// Command templates
const commandTemplates = ref([
  {
    id: "npm-start",
    name: "npm start",
    command: "npm start",
    description: "Start development server",
    category: "dev",
    icon: CodeIcon,
  },
  {
    id: "npm-build",
    name: "npm build",
    command: "npm run build",
    description: "Build for production",
    category: "dev",
    icon: CodeIcon,
  },
  {
    id: "git-status",
    name: "git status",
    command: "git status",
    description: "Check git status",
    category: "dev",
    icon: CodeIcon,
  },
  {
    id: "docker-logs",
    name: "docker logs",
    command: "docker-compose logs -f",
    description: "Follow docker logs",
    category: "server",
    icon: ServerIcon,
  },
  {
    id: "tail-logs",
    name: "tail logs",
    command: "tail -f /var/log/app.log",
    description: "Follow application logs",
    category: "server",
    icon: ServerIcon,
  },
  {
    id: "mysql-cli",
    name: "mysql",
    command: "mysql -u root -p",
    description: "MySQL command line",
    category: "database",
    icon: DatabaseIcon,
  },
  {
    id: "redis-cli",
    name: "redis-cli",
    command: "redis-cli",
    description: "Redis command line",
    category: "database",
    icon: DatabaseIcon,
  },
  {
    id: "curl-test",
    name: "curl test",
    command: "curl -X GET http://localhost:3000/api/health",
    description: "Test API endpoint",
    category: "web",
    icon: GlobeIcon,
  },
  {
    id: "htop",
    name: "htop",
    command: "htop",
    description: "System monitor",
    category: "system",
    icon: TerminalIcon,
  },
  {
    id: "cd-project",
    name: "cd project",
    command: "cd ~/projects/my-app",
    description: "Navigate to project",
    category: "system",
    icon: FolderIcon,
  },
]);

// Export tabs
const exportTabs = ref([
  { value: "script", label: "Bash Script", icon: TerminalIcon },
  { value: "commands", label: "Commands", icon: TerminalIcon },
  { value: "config", label: "Config", icon: FileTextIcon },
]);

// Computed properties
const categories = computed(() => {
  return [...new Set(commandTemplates.value.map((t) => t.category))];
});

const filteredTemplates = computed(() => {
  return commandTemplates.value.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      template.command.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      template.description
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase());
    const matchesCategory =
      !selectedCategory.value || template.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const rootPanes = computed(() => {
  return panes.value.filter((pane) => !pane.parent);
});

const selectedPaneData = computed(() => {
  return findPaneById(selectedPane.value);
});

const bashScript = computed(() => {
  const sessionName = "tmux-session";
  let script = `#!/bin/bash\n\n# Tmux Layout Script\n# Generated by Tmux Layout Builder\n\n`;
  script += `tmux new-session -d -s ${sessionName}\n\n`;

  panes.value.forEach((pane, index) => {
    if (index === 0) {
      script += `tmux send-keys -t ${sessionName}:0.0 '${pane.command}' Enter\n`;
    } else {
      script += `tmux split-window -t ${sessionName}\n`;
      script += `tmux send-keys -t ${sessionName}:0.${index} '${pane.command}' Enter\n`;
    }
  });

  script += `\ntmux select-layout -t ${sessionName} tiled\n`;
  script += `tmux attach-session -t ${sessionName}\n`;

  return script;
});

const manualCommands = computed(() => {
  const sessionName = "tmux-session";
  let commands = `# Manual Tmux Commands\n# Generated by Tmux Layout Builder\n\n`;
  commands += `tmux new-session -d -s ${sessionName}\n`;

  panes.value.forEach((pane, index) => {
    if (index === 0) {
      commands += `tmux send-keys -t ${sessionName}:0.0 '${pane.command}' Enter\n`;
    } else {
      commands += `tmux split-window -t ${sessionName}\n`;
      commands += `tmux send-keys -t ${sessionName}:0.${index} '${pane.command}' Enter\n`;
    }
  });

  commands += `tmux select-layout -t ${sessionName} tiled\n`;
  commands += `tmux attach-session -t ${sessionName}\n`;

  return commands;
});

const jsonConfig = computed(() => {
  return JSON.stringify(
    {
      session: "tmux-session",
      layout: rootDirection.value,
      panes: panes.value.map((pane) => ({
        id: pane.id,
        command: pane.command,
        size: pane.size,
      })),
    },
    null,
    2
  );
});

// Pane Component
const PaneComponent = {
  props: ["pane", "selectedPane", "commandTemplates"],
  emits: ["select", "split", "updateCommand", "dragStart", "dragOver", "drop"],
  template: `
    <div
      :class="[
        'border-2 rounded-md p-3 min-h-[100px] transition-all cursor-pointer relative',
        selectedPane === pane.id
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 bg-card'
      ]"
      @click="$emit('select', pane.id)"
      @dragover.prevent="$emit('dragOver', $event, pane.id)"
      @drop.prevent="$emit('drop', $event, pane.id)"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <GripVerticalIcon class="w-3 h-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
          <span class="text-sm font-medium">Pane {{ pane.id }}</span>
        </div>
        <div class="flex gap-1">
          <button
            @click.stop="$emit('split', pane.id, 'horizontal')"
            class="p-1 hover:bg-accent rounded text-xs"
            title="Split Horizontal"
          >
            <SplitHorizontalIcon class="w-3 h-3" />
          </button>
          <button
            @click.stop="$emit('split', pane.id, 'vertical')"
            class="p-1 hover:bg-accent rounded text-xs"
            title="Split Vertical"
          >
            <SplitVerticalIcon class="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div class="space-y-2">
        <div>
          <label class="text-xs text-muted-foreground">Command:</label>
          <input
            :value="pane.command"
            @input="$emit('updateCommand', pane.id, $event.target.value)"
            @click.stop
            type="text"
            class="w-full mt-1 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter command..."
          >
        </div>
      </div>
      
      <div v-if="pane.children && pane.children.length > 0" class="mt-3 space-y-2">
        <PaneComponent
          v-for="child in pane.children"
          :key="child.id"
          :pane="child"
          :selected-pane="selectedPane"
          :command-templates="commandTemplates"
          @select="$emit('select', $arguments[0])"
          @split="$emit('split', $arguments[0], $arguments[1])"
          @update-command="$emit('updateCommand', $arguments[0], $arguments[1])"
          @drag-start="$emit('dragStart', $arguments[0])"
          @drag-over="$emit('dragOver', $arguments[0], $arguments[1])"
          @drop="$emit('drop', $arguments[0], $arguments[1])"
        />
      </div>
    </div>
  `,
  components: {
    GripVerticalIcon,
    SplitHorizontalIcon,
    SplitVerticalIcon,
  },
};

// Methods
const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme.value === "dark");
};

const addPane = () => {
  const newId = String(panes.value.length + 1);
  panes.value.push({
    id: newId,
    command: "bash",
    size: 1,
    children: [],
  });
};

const selectPane = (paneId) => {
  selectedPane.value = paneId;
};

const splitPane = (paneId, direction) => {
  const pane = findPaneById(paneId);
  if (!pane) return;

  const newId = String(panes.value.length + 1);
  const newPane = {
    id: newId,
    command: "bash",
    size: 0.5,
    children: [],
  };

  pane.size = 0.5;

  if (!pane.children) pane.children = [];
  pane.children.push(newPane);
  pane.direction = direction;

  panes.value.push(newPane);
};

const updatePaneCommand = (paneId, command) => {
  const pane = findPaneById(paneId);
  if (pane) {
    pane.command = command;
  }
};

const resetLayout = () => {
  panes.value = [{ id: "1", command: "bash", size: 1, children: [] }];
  selectedPane.value = null;
};

const findPaneById = (id) => {
  return panes.value.find((pane) => pane.id === id);
};

const applyTemplate = (template) => {
  if (selectedPane.value) {
    updatePaneCommand(selectedPane.value, template.command);
  }
};

const handleTemplateDragStart = (event, template) => {
  draggedTemplate.value = template;
  event.dataTransfer.setData("text/plain", template.id);
};

const handleDragStart = (paneId) => {
  draggedPane.value = paneId;
};

const handleDragOver = (event, paneId) => {
  event.preventDefault();
};

const handleDrop = (event, paneId) => {
  event.preventDefault();

  if (draggedTemplate.value) {
    updatePaneCommand(paneId, draggedTemplate.value.command);
    draggedTemplate.value = null;
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};

const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Lifecycle
onMounted(() => {
  // Initialize theme
  const savedTheme = localStorage.getItem("theme") || "light";
  theme.value = savedTheme;
  document.documentElement.classList.toggle("dark", savedTheme === "dark");

  // Select first pane by default
  if (panes.value.length > 0) {
    selectedPane.value = panes.value[0].id;
  }
});
</script>

<style scoped>
/* Custom styles for the tmux layout builder */
.container {
  max-width: 1400px;
}

/* Dark mode styles */
:global(.dark) {
  --background: 222.2% 84% 4.9%;
  --foreground: 210% 40% 98%;
  --card: 222.2% 84% 4.9%;
  --card-foreground: 210% 40% 98%;
  --popover: 222.2% 84% 4.9%;
  --popover-foreground: 210% 40% 98%;
  --primary: 210% 40% 98%;
  --primary-foreground: 222.2% 84% 4.9%;
  --secondary: 217.2% 32.6% 17.5%;
  --secondary-foreground: 210% 40% 98%;
  --muted: 217.2% 32.6% 17.5%;
  --muted-foreground: 215% 20.2% 65.1%;
  --accent: 217.2% 32.6% 17.5%;
  --accent-foreground: 210% 40% 98%;
  --destructive: 0% 62.8% 30.6%;
  --destructive-foreground: 210% 40% 98%;
  --border: 217.2% 32.6% 17.5%;
  --input: 217.2% 32.6% 17.5%;
  --ring: 212.7% 26.8% 83.9%;
}

/* Light mode styles */
:global(.light) {
  --background: 0% 0% 100%;
  --foreground: 222.2% 84% 4.9%;
  --card: 0% 0% 100%;
  --card-foreground: 222.2% 84% 4.9%;
  --popover: 0% 0% 100%;
  --popover-foreground: 222.2% 84% 4.9%;
  --primary: 222.2% 47.4% 11.2%;
  --primary-foreground: 210% 40% 98%;
  --secondary: 210% 40% 96%;
  --secondary-foreground: 222.2% 47.4% 11.2%;
  --muted: 210% 40% 96%;
  --muted-foreground: 215.4% 16.3% 46.9%;
  --accent: 210% 40% 96%;
  --accent-foreground: 222.2% 47.4% 11.2%;
  --destructive: 0% 84.2% 60.2%;
  --destructive-foreground: 210% 40% 98%;
  --border: 214.3% 31.8% 91.4%;
  --input: 214.3% 31.8% 91.4%;
  --ring: 222.2% 84% 4.9%;
}

/* Apply CSS custom properties */
.bg-background {
  background-color: hsl(var(--background));
}
.text-foreground {
  color: hsl(var(--foreground));
}
.bg-card {
  background-color: hsl(var(--card));
}
.text-card-foreground {
  color: hsl(var(--card-foreground));
}
.bg-primary {
  background-color: hsl(var(--primary));
}
.text-primary-foreground {
  color: hsl(var(--primary-foreground));
}
.bg-secondary {
  background-color: hsl(var(--secondary));
}
.text-secondary-foreground {
  color: hsl(var(--secondary-foreground));
}
.bg-muted {
  background-color: hsl(var(--muted));
}
.text-muted-foreground {
  color: hsl(var(--muted-foreground));
}
.bg-accent {
  background-color: hsl(var(--accent));
}
.text-accent-foreground {
  color: hsl(var(--accent-foreground));
}
.border-border {
  border-color: hsl(var(--border));
}
.border-primary {
  border-color: hsl(var(--primary));
}

/* Utility classes */
.transition-colors {
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}
.transition-all {
  transition: all 0.2s;
}
.cursor-grab {
  cursor: grab;
}
.cursor-grabbing {
  cursor: grabbing;
}
</style>
