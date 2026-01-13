'use client';

import { useEffect, useState } from 'react';
import { getPolicies, updatePolicies, type PolicySection, type Policies } from '@/app/actions/policies';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface PolicySections {
  [key: string]: PolicySection | null;
}

// Función helper para separar HTML en título y contenido
function parseSection(html: string | null): PolicySection | null {
  if (!html) return null;
  
  const h3Match = html.match(/<h3>(.*?)<\/h3>/);
  const spanMatch = html.match(/<span>(.*?)<\/span>/s);
  
  if (!h3Match || !spanMatch) return null;
  
  return {
    title: h3Match[1],
    content: spanMatch[1],
  };
}

// Función helper para convertir datos de DB a formato de formulario
function parsePoliciesForForm(policies: Policies | null): Record<string, PolicySection | null> {
  if (!policies) {
    return {
      section_1: null,
      section_2: null,
      section_3: null,
      section_4: null,
      section_5: null,
      section_6: null,
      section_7: null,
      section_8: null,
      section_9: null,
      section_10: null,
    };
  }

  return {
    section_1: parseSection(policies.section_1 || null),
    section_2: parseSection(policies.section_2 || null),
    section_3: parseSection(policies.section_3 || null),
    section_4: parseSection(policies.section_4 || null),
    section_5: parseSection(policies.section_5 || null),
    section_6: parseSection(policies.section_6 || null),
    section_7: parseSection(policies.section_7 || null),
    section_8: parseSection(policies.section_8 || null),
    section_9: parseSection(policies.section_9 || null),
    section_10: parseSection(policies.section_10 || null),
  };
}

export default function PoliciesPage() {
  const [sections, setSections] = useState<PolicySections>({
    section_1: null,
    section_2: null,
    section_3: null,
    section_4: null,
    section_5: null,
    section_6: null,
    section_7: null,
    section_8: null,
    section_9: null,
    section_10: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['section_1']));

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies() {
    setLoading(true);
    const result = await getPolicies();
    if (result.success && result.data) {
      const parsedData = parsePoliciesForForm(result.data);
      setSections(parsedData);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await updatePolicies(sections);
    if (result.success) {
      alert('✅ Políticas guardadas exitosamente');
    } else {
      alert('❌ ' + (result.error || 'Error al guardar'));
    }

    setSaving(false);
  };

  const handleSectionChange = (sectionKey: string, field: 'title' | 'content', value: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        title: field === 'title' ? value : prev[sectionKey]?.title || '',
        content: field === 'content' ? value : prev[sectionKey]?.content || '',
      }
    }));
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(Object.keys(sections)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando políticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Políticas del Sitio</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Gestiona las secciones de políticas y términos de servicio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={expandAll}
            className="text-xs sm:text-sm"
          >
            Expandir Todo
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={collapseAll}
            className="text-xs sm:text-sm"
          >
            Contraer Todo
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Secciones de Políticas */}
        {Object.keys(sections).map((sectionKey, index) => {
          const section = sections[sectionKey];
          const isExpanded = expandedSections.has(sectionKey);
          const sectionNumber = index + 1;

          return (
            <Card key={sectionKey} className="p-4 sm:p-6">
              {/* Header de la Sección */}
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection(sectionKey)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-cyber-purple" size={24} />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      Sección {sectionNumber}
                      {section?.title && (
                        <span className="ml-2 text-sm text-gray-400 font-normal">
                          - {section.title}
                        </span>
                      )}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </button>
              </div>

              {/* Contenido de la Sección */}
              {isExpanded && (
                <div className="space-y-4 animate-fade-in">
                  <Input
                    label={`Título de la Sección ${sectionNumber}`}
                    value={section?.title || ''}
                    onChange={(e) => handleSectionChange(sectionKey, 'title', e.target.value)}
                    placeholder={`Ej: ${sectionNumber}. Service Agreement`}
                  />

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-200">
                      Contenido de la Sección {sectionNumber}
                    </label>
                    <textarea
                      value={section?.content || ''}
                      onChange={(e) => handleSectionChange(sectionKey, 'content', e.target.value)}
                      rows={6}
                      placeholder="Escribe el contenido de esta sección..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 focus:border-cyber-purple transition-all duration-300 resize-vertical"
                    />
                    <p className="text-xs text-gray-400">
                      El título se guardará con etiquetas <code className="text-cyber-purple">&lt;h3&gt;</code> y el contenido con <code className="text-cyber-purple">&lt;span&gt;</code>
                    </p>
                  </div>

                  {/* Vista previa del HTML generado */}
                  {section?.title && section?.content && (
                    <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Vista previa del HTML:</p>
                      <div className="text-xs text-gray-300 font-mono break-all">
                        &lt;h3&gt;{section.title}&lt;/h3&gt;&lt;span&gt;{section.content.substring(0, 100)}{section.content.length > 100 ? '...' : ''}&lt;/span&gt;
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {/* Botón de Guardar */}
        <div className="flex justify-end sticky bottom-4 z-10">
          <Button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto shadow-lg"
          >
            {saving ? 'Guardando...' : 'Guardar Políticas'}
          </Button>
        </div>
      </form>
    </div>
  );
}
