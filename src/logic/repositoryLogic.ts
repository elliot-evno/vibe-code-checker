import { kea } from 'kea'
import { actions, reducers, listeners, selectors } from 'kea'

export interface RepositoryLogicType {
  actions: {
    setEvaluationData: (data: any) => { data: any }
    clearEvaluationData: () => void
    setIsAnalyzing: (isAnalyzing: boolean) => { isAnalyzing: boolean }
  }
  reducers: {
    evaluationData: any | null
    isAnalyzing: boolean
  }
  selectors: {
    evaluationData: [() => any, any | null]
    isAnalyzing: [() => boolean, boolean]
  }
}

export const repositoryLogic = kea<RepositoryLogicType>({
  actions: {
    setEvaluationData: (data) => ({ data }),
    clearEvaluationData: () => ({}),
    setIsAnalyzing: (isAnalyzing) => ({ isAnalyzing }),
  },
  reducers: {
    evaluationData: [
      null,
      {
        setEvaluationData: (_, { data }) => data,
        clearEvaluationData: () => null,
      }
    ],
    isAnalyzing: [
      false,
      {
        setIsAnalyzing: (_, { isAnalyzing }) => isAnalyzing,
      }
    ],
  },
  selectors: {
    evaluationData: [
      (selectors) => [selectors.evaluationData],
      (evaluationData) => evaluationData
    ],
    isAnalyzing: [
      (selectors) => [selectors.isAnalyzing],
      (isAnalyzing) => isAnalyzing
    ],
  },
})

export default repositoryLogic 