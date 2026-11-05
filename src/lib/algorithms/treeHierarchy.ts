import { Subject, Unit, Topic, Subtopic } from '../../types/index.ts';

export interface AcademicTreeNode {
  id: string;
  name: string;
  level: 'course' | 'subject' | 'unit' | 'topic' | 'subtopic';
  code?: string;
  description?: string;
  difficulty?: string;
  color?: string;
  children: AcademicTreeNode[];
  isExpanded?: boolean;
  totalSubnodes?: number;
}

/**
 * Builds a hierarchical N-ary tree from flat subjects, units, topics, and subtopics
 */
export function buildAcademicHierarchyTree(
  subjects: Subject[],
  units: Unit[],
  topics: Topic[],
  subtopics: Subtopic[]
): AcademicTreeNode {
  const root: AcademicTreeNode = {
    id: 'course-root',
    name: 'Computer Science & Engineering Curriculum',
    level: 'course',
    description: 'Accredited Academic Curriculum Knowledge Hierarchy',
    children: [],
  };

  for (const subject of subjects) {
    const subjectNode: AcademicTreeNode = {
      id: `subj-${subject.id}`,
      name: subject.name,
      code: subject.code,
      level: 'subject',
      description: subject.description,
      color: subject.color,
      children: [],
    };

    const subjectUnits = units.filter(u => u.subjectId === subject.id);
    for (const unit of subjectUnits) {
      const unitNode: AcademicTreeNode = {
        id: `unit-${unit.id}`,
        name: `Unit ${unit.unitNumber}: ${unit.name}`,
        level: 'unit',
        description: unit.description,
        children: [],
      };

      const unitTopics = topics.filter(t => t.unitId === unit.id);
      for (const topic of unitTopics) {
        const topicNode: AcademicTreeNode = {
          id: `topic-${topic.id}`,
          name: topic.name,
          code: topic.code,
          level: 'topic',
          description: topic.description,
          difficulty: topic.difficulty,
          children: [],
        };

        const topicSubtopics = subtopics.filter(st => st.topicId === topic.id);
        for (const st of topicSubtopics) {
          topicNode.children.push({
            id: `subtopic-${st.id}`,
            name: st.name,
            level: 'subtopic',
            description: st.description,
            children: [],
          });
        }

        unitNode.children.push(topicNode);
      }

      subjectNode.children.push(unitNode);
    }

    root.children.push(subjectNode);
  }

  // Count total subnodes
  function computeSubnodeCounts(node: AcademicTreeNode): number {
    let count = node.children.length;
    for (const child of node.children) {
      count += computeSubnodeCounts(child);
    }
    node.totalSubnodes = count;
    return count;
  }

  computeSubnodeCounts(root);
  return root;
}

/**
 * Performs Pre-order, Post-order, or Level-order traversal on academic tree
 */
export function traverseAcademicTree(
  root: AcademicTreeNode,
  order: 'preorder' | 'postorder' | 'levelorder'
): { id: string; name: string; level: string }[] {
  const result: { id: string; name: string; level: string }[] = [];

  if (order === 'preorder') {
    function pre(node: AcademicTreeNode) {
      result.push({ id: node.id, name: node.name, level: node.level });
      for (const child of node.children) {
        pre(child);
      }
    }
    pre(root);
  } else if (order === 'postorder') {
    function post(node: AcademicTreeNode) {
      for (const child of node.children) {
        post(child);
      }
      result.push({ id: node.id, name: node.name, level: node.level });
    }
    post(root);
  } else {
    // Level-order (BFS on tree)
    const queue: AcademicTreeNode[] = [root];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      result.push({ id: curr.id, name: curr.name, level: curr.level });
      for (const child of curr.children) {
        queue.push(child);
      }
    }
  }

  return result;
}
