import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { ChartDataFields, GetChartDataResponse } from 'utils';
import { useDeleteChartData } from '../../../../../telemed';
import { useChartData } from '../../../hooks/useChartData';
import { EditableNote, UseDeleteNote } from '../types';
import { useChartDataCacheKey } from './useChartDataCacheKey';

export const useDeleteNote: UseDeleteNote = ({ encounterId, apiConfig, locales }) => {
  const queryClient = useQueryClient();
  const { mutate: deleteChartData } = useDeleteChartData();
  const { refetch } = useChartData({
    encounterId,
    requestedFields: { [apiConfig.fieldName]: apiConfig.searchParams },
  });
  const cacheKey = useChartDataCacheKey(apiConfig.fieldName, apiConfig.searchParams);

  const handleDelete = useCallback(
    async (entity: EditableNote): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        deleteChartData({ [apiConfig.fieldName]: [{ resourceId: entity.resourceId }] } as ChartDataFields, {
          onSuccess: async () => {
            try {
              const result = queryClient.setQueryData(cacheKey, (oldData: any) => {
                if (oldData?.[apiConfig.fieldName]) {
                  return {
                    ...oldData,
                    [apiConfig.fieldName]: (
                      oldData[apiConfig.fieldName] as GetChartDataResponse[typeof apiConfig.fieldName]
                    )?.filter((note) => note?.resourceId !== entity.resourceId),
                  };
                }
                return oldData;
              });
              if (result?.[apiConfig.fieldName] === undefined) {
                // refetch all if the cache didn't found
                await refetch();
              }
              resolve();
            } catch (error) {
              console.error(error);
              enqueueSnackbar(locales.getErrorMessage('deletion', locales.entityLabel), { variant: 'error' });
              reject(error);
            }
          },
          onError: (error) => {
            console.error(error);
            enqueueSnackbar(locales.getErrorMessage('deletion', locales.entityLabel), { variant: 'error' });
            reject(error);
          },
        });
      });
    },
    [apiConfig, cacheKey, deleteChartData, locales, queryClient, refetch]
  );

  return handleDelete;
};
